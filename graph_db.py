import os
from falkordb import FalkorDB
from dotenv import load_dotenv

load_dotenv()

def connect_to_graph():
    """Connect to FalkorDB and select our graph"""
    host=os.getenv("FALKORDB_HOST","localhost")
    port=int(os.getenv("FALKORDB_PORT","6379"))

    db=FalkorDB(host=host,port=port)
    graph=db.select_graph("ResearchGraph")

    return graph