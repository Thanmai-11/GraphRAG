
import os
from typing import Optional

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

load_dotenv()


# Define the structure of extracted facts

class PersonFact(BaseModel):
    name: str
    role: Optional[str] = None
    organizations: list[str] = Field(default_factory=list)


class PaperFact(BaseModel):
    title: str
    year: Optional[int] = None
    authors: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)


class ExtractedFacts(BaseModel):
    people: list[PersonFact] = Field(default_factory=list)
    papers: list[PaperFact] = Field(default_factory=list)


# Connect to Gemini

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found. Check your .env file."
    )

client = genai.Client(api_key=api_key)


def extract_facts(document_text: str) -> ExtractedFacts:
    prompt = f"""
    Extract research-related facts from the document below.

    Identify:
    1. People, their roles, and organizations.
    2. Papers, publication years, authors, and topics.

    Rules:
    - Extract only information supported by the document.
    - Do not invent names, relationships, years, or topics.
    - If a fact is unknown, leave the optional field empty
      and use an empty list for missing collections.
    - Combine repeated references to the same person or paper.

    Document:
    ---
    {document_text}
    ---
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": ExtractedFacts.model_json_schema(),
        },
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    return ExtractedFacts.model_validate_json(response.text)
