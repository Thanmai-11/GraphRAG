from graph_db import connect_to_graph
from extract_facts import extract_facts
from pathlib import Path

graph = connect_to_graph()


def store_facts(facts):
    # Store people and their affiliations.
    for person in facts.people:
        graph.query(
            """
            MERGE (p:Person {name: $name})
            SET p.role = coalesce($role, p.role)
            """,
            params={
                "name": person.name,
                "role": person.role,
            },
        )

        for organization in person.organizations:
            graph.query(
                """
                MATCH (p:Person {name: $person})
                MERGE (o:Organization {name: $organization})
                MERGE (p)-[:WORKS_AT]->(o)
                """,
                params={
                    "person": person.name,
                    "organization": organization,
                },
            )

    # Store papers, authors, and topics.
    for paper in facts.papers:
        graph.query(
            """
            MERGE (paper:Paper {title: $title})
            SET paper.year = coalesce($year, paper.year)
            """,
            params={
                "title": paper.title,
                "year": paper.year,
            },
        )

        for author in paper.authors:
            graph.query(
                """
                MERGE (p:Person {name: $author})
                MERGE (p)-[:WROTE]->(paper:Paper {title: $title})
                """,
                params={
                    "author": author,
                    "title": paper.title,
                },
            )

        for topic in paper.topics:
            graph.query(
                """
                MERGE (t:Topic {name: $topic})
                MERGE (paper:Paper {title: $title})
                MERGE (paper)-[:ABOUT]->(t)
                """,
                params={
                    "topic": topic,
                    "title": paper.title,
                },
            )

    print("Extracted facts stored in FalkorDB!")


def ingest_document(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        document_text = file.read()

    facts = extract_facts(document_text)

    print("\nExtracted facts:")
    print(facts.model_dump_json(indent=2))

    store_facts(facts)

if __name__ == "__main__":
    documents_dir = Path("documents")
    document_files = sorted(documents_dir.glob("*.txt"))

    if not document_files:
        print("No .txt documents found in the documents folder.")
    else:
        print(f"Found {len(document_files)} document(s).")

        for file_path in document_files:
            print(f"\nProcessing: {file_path}")
            try:
                ingest_document(str(file_path))
            except Exception as error:
                print(f"Failed to process {file_path}: {error}")

        print("\nDocument ingestion finished.")
