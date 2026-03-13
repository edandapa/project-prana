import os
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load secrets from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL")

def fetch_ai_news():
    """Gathers the last 7 days of high-impact AI news."""
    last_week = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    query = '( "artificial intelligence" OR "generative AI" OR "agentic AI" ) AND ( breakthrough OR regulation OR investment OR deployment )'
    
    url = f"https://newsapi.org/v2/everything?q={query}&from={last_week}&sortBy=relevance&pageSize=15&apiKey={NEWS_API_KEY}"
    response = requests.get(url)
    articles = response.json().get('articles', [])
    
    return [{"title": a['title'], "description": a['description'], "url": a['url'], "imageUrl": a['urlToImage']} for a in articles]

def summarize_with_gemini(articles):
    """Uses Gemini 2.0 Flash to synthesize the news into a strategic digest."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
    prompt = {
        "contents": [{
            "parts": [{
                "text": f"Analyze these articles and select the top 5 strategic stories. Return ONLY a JSON array with 'title', 'overview' (impact-focused), 'bullets' (3-5 points), 'imageUrl', and 'url'. Data: {json.dumps(articles)}"
            }]
        }],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    
    response = requests.post(url, json=prompt)
    raw_text = response.json()['candidates'][0]['content']['parts'][0]['text']
    return json.loads(raw_text)

if __name__ == "__main__":
    print("🚀 Starting AI News Agent...")
    news = fetch_ai_news()
    digest = summarize_with_gemini(news)
    print(f"✅ Generated digest with {len(digest)} items.")
    # In a local Python environment, you would use an SMTP library or SendGrid to email.
    print(json.dumps(digest, indent=2))