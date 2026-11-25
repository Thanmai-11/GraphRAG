import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

MOCK_MODE = os.getenv("RESEARCHGRAPH_MOCK", "true").lower() in {
    "1", "true", "yes", "on"
}

app = FastAPI(
    title="ResearchGraph AI API",
    version="0.1.0",
    description="API for a research knowledge graph and assistant.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_GRAPH = {
    "nodes": [
        {"id": "alice", "label": "Alice", "type": "Person"},
        {"id": "mit", "label": "MIT", "type": "Organization"},
        {"id": "paper1", "label": "GraphRAG Basics", "type": "Paper"},
        {"id": "topic1", "label": "RAG", "type": "Topic"},
        {"id": "topic2", "label": "Graph Databases", "type": "Topic"},
        {"id": "carol", "label": "Carol", "type": "Person"},
        {"id": "bob", "label": "Bob", "type": "Person"},
        {"id": "stanford", "label": "Stanford University", "type": "Organization"},
        {"id": "paper2", "label": "Knowledge Graph Applications", "type": "Paper"},
    ],
    "edges": [
        {"source": "alice", "target": "mit", "label": "WORKS_AT"},
        {"source": "carol", "target": "mit", "label": "WORKS_AT"},
        {"source": "alice", "target": "paper1", "label": "WROTE"},
        {"source": "paper1", "target": "topic1", "label": "ABOUT"},
        {"source": "paper1", "target": "topic2", "label": "ABOUT"},
        {"source": "bob", "target": "stanford", "label": "WORKS_AT"},
        {"source": "bob", "target": "paper2", "label": "WROTE"},
    ],
}


def get_real_graph():
    """Connect to the existing graph code only when mock mode is disabled."""
    from graph_db import connect_to_graph
    return connect_to_graph()


def graph_count(graph, query):
    result = graph.query(query)
    return int(result.result_set[0][0])


def get_dashboard_data():
    if MOCK_MODE:
        return {
            "mode": "mock",
            "stats": {
                "researchers": 3,
                "papers": 2,
                "organizations": 2,
                "topics": 2,
            },
            "recent_activity": [
                {
                    "title": "GraphRAG Basics",
                    "description": "Research paper in the demo graph",
                    "kind": "Paper",
                },
                {
                    "title": "Alice",
                    "description": "Researcher associated with MIT",
                    "kind": "Researcher",
                },
                {
                    "title": "Knowledge Graph Applications",
                    "description": "Research paper in the demo graph",
                    "kind": "Paper",
                },
            ],
        }

    graph = get_real_graph()
    stats = {
        "researchers": graph_count(
            graph, "MATCH (n:Person) RETURN count(n)"
        ),
        "papers": graph_count(
            graph, "MATCH (n:Paper) RETURN count(n)"
        ),
        "organizations": graph_count(
            graph, "MATCH (n:Organization) RETURN count(n)"
        ),
        "topics": graph_count(
            graph, "MATCH (n:Topic) RETURN count(n)"
        ),
    }

    return {
        "mode": "live",
        "stats": stats,
        "recent_activity": [],
    }


@app.get("/")
def root():
    return {
        "name": "ResearchGraph AI API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "mode": "mock" if MOCK_MODE else "live",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/dashboard")
def dashboard():
    try:
        return get_dashboard_data()
    except Exception as exc:
        # Report the connection problem instead of presenting mock numbers
        # as real data when the user has explicitly selected live mode.
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail=f"Could not load live graph data: {exc}",
        ) from exc


@app.get("/api/graph")
def graph_data():
    if MOCK_MODE:
        return MOCK_GRAPH

    try:
        graph = get_real_graph()

        node_result = graph.query("""
            MATCH (n)
            WHERE n:Person OR n:Organization OR n:Paper OR n:Topic
            RETURN id(n), labels(n), n.name, n.title, n.year
            LIMIT 200
        """)

        nodes = []
        for row in node_result.result_set:
            node_id, labels, name, title, year = row
            node_type = labels[0] if labels else "Unknown"
            label = name or title or str(node_id)
            node = {
                "id": str(node_id),
                "label": str(label),
                "type": node_type,
            }
            if year is not None:
                node["year"] = year
            nodes.append(node)

        edge_result = graph.query("""
            MATCH (a)-[r]->(b)
            WHERE (a:Person OR a:Organization OR a:Paper OR a:Topic)
              AND (b:Person OR b:Organization OR b:Paper OR b:Topic)
            RETURN id(a), type(r), id(b)
            LIMIT 400
        """)

        edges = [
            {
                "source": str(row[0]),
                "label": str(row[1]),
                "target": str(row[2]),
            }
            for row in edge_result.result_set
        ]

        return {"nodes": nodes, "edges": edges}

    except Exception as exc:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail=f"Could not load the live graph: {exc}",
        ) from exc
