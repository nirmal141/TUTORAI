from typing import List, Dict

from duckduckgo_search import DDGS

async def get_web_search_results(query: str, professor: Dict, num_results: int = 5):
    try:
        ddgs = DDGS()
        academic_queries = [
            f"{professor['name']} {professor['field']} {query}",
            f"{query} {professor['field']} research papers",
            f"{professor['name']} github {professor['field']}",
            f"{professor['name']} academic publications",
            f"{query} {professor['field']} educational resources"
        ]
        
        all_results = []
        formatted_results = []
        search_context = "Relevant academic and research sources:\n\n"

        for specialized_query in academic_queries:
            results = list(ddgs.text(specialized_query, max_results=3))
            all_results.extend(results)

        seen_links = set()

        for result in all_results:
            link = result.get('href', '')
            if not link or link in seen_links:
                continue
            
            seen_links.add(link)

            # Prioritize academic and research sources
            priority_domains = [
                'scholar.google.com', 'researchgate.net', 'academia.edu',
                'github.com', 'arxiv.org', 'ieee.org', 'acm.org',
                'springer.com', 'sciencedirect.com'
            ]
            
            is_priority = any(domain in link.lower() for domain in priority_domains)
            
            formatted_result = {
                "title": result.get('title', 'No title').strip(),
                "link": link,
                "summary": result.get('body', 'No summary available').strip(),
                "is_academic": is_priority
            }
            
            formatted_results.append(formatted_result)
            search_context += f"{len(formatted_results)}. {formatted_result['title']}\n"
            search_context += f"Source: {formatted_result['link']}\n"
            if is_priority:
                search_context += "[Academic/Research Source]\n"
            search_context += f"Summary: {formatted_result['summary']}\n\n"
            
            if len(formatted_results) >= num_results:
                break
        
        return search_context, formatted_results
    except Exception as e:
        print(f"Search error: {str(e)}")
        return "", []
