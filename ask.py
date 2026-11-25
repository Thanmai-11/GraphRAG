
import json

from google import genai
from graph_db import connect_to_graph

client = genai.Client()
graph = connect_to_graph()

SCHEMA = """
Node labels and properties:
- Person: name, role
- Organization: name
- Paper: title, year
- Topic: name

Relationships:
- (Person)-[:WORKS_AT]->(Organization)
- (Person)-[:WROTE]->(Paper)
- (Paper)-[:ABOUT]->(Topic)
"""

def get_graph_context():
    """Fetch actual values stored in the graph."""

    queries = {
        "organizations": """
            MATCH (o:Organization)
            RETURN DISTINCT o.name
            ORDER BY o.name
            LIMIT 50
        """,
        "topics": """
            MATCH (t:Topic)
            RETURN DISTINCT t.name
            ORDER BY t.name
            LIMIT 50
        """,
        "papers": """
            MATCH (p:Paper)
            RETURN DISTINCT p.title
            ORDER BY p.title
            LIMIT 50
        """
    }

    context = {}

    for category, query in queries.items():
        result = graph.query(query)
        context[category] = [
            row[0] for row in result.result_set
            if row[0] is not None
        ]

    return context


def generate_cypher(question):
    graph_context = get_graph_context()

    prompt = f"""
You generate read-only Cypher queries for a FalkorDB research graph.

Graph schema:
{SCHEMA}

Actual values stored in the graph:
{json.dumps(graph_context, indent=2)}

User question:
{question}

Rules:
- Generate exactly one read-only Cypher query.
- Use only the provided labels, properties, and relationships.
- Use the actual graph values to resolve names and synonyms.
- For example, "Stanford", "Stanford uni", and
  "Stanford University" may refer to the stored value
  "Stanford University".
- Use the canonical stored value when filtering by a name.
- For organization lookups, traverse
  (person:Person)-[:WORKS_AT]->(organization:Organization).
- For paper topics, traverse
  (paper:Paper)-[:ABOUT]->(topic:Topic).
- For authors, traverse
  (person:Person)-[:WROTE]->(paper:Paper).
- Search topic names when the user asks what a paper discusses.
- Use case-insensitive matching when appropriate.
- If no matching graph value exists, do not invent one.
- Never use CREATE, MERGE, DELETE, SET, REMOVE, CALL,
  DROP, DETACH, LOAD CSV, or other write operations.
- Return useful fields with clear aliases.
- Return only Cypher, without markdown fences.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return (
        response.text.strip()
        .replace("```cypher", "")
        .replace("```", "")
        .strip()
    )


def answer_question(question):
    cypher = generate_cypher(question)
    print("\nGenerated Cypher:\n", cypher)

    # Basic safety check before running generated query.
    normalized = cypher.upper()
    forbidden = [
        "CREATE", "MERGE", "DELETE", "SET", "REMOVE",
        "CALL", "DROP", "DETACH", "LOAD CSV"
    ]

    if not normalized.startswith("MATCH"):
        raise ValueError("Only MATCH queries are allowed.")

    if any(word in normalized for word in forbidden):
        raise ValueError("Generated query contains a forbidden operation.")

    result = graph.query(cypher)
    rows = result.result_set

    if not rows:
        print("\nNo matching information was found in the graph.")
        return

    retrieved_data = json.dumps(rows, default=str)

    prompt = f"""
You are answering a research question using a knowledge graph.

The following Cypher query was executed successfully against
FalkorDB. The returned rows are the results of that query.

User question:
{question}

Executed Cypher query:
{cypher}

Retrieved graph data:
{retrieved_data}

Instructions:
- Interpret the retrieved rows in the context of the executed query.
- The query's MATCH and WHERE clauses establish the graph
  relationships and filters used to retrieve these rows.
- Answer directly using the returned data.
- Do not invent additional facts.
- If the returned data is empty, explain that no matching
  information was found in the graph.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    print("\nAnswer:\n", response.text)


if __name__ == "__main__":
    while True:
        question = input("\nAsk a research question (or type 'exit'): ")

        if question.strip().lower() == "exit":
            break

        if question.strip():
            try:
                answer_question(question)
            except Exception as error:
                print(f"\nError: {error}")
