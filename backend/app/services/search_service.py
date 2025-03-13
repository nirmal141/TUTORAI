import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import asyncio
from typing import Tuple, List, Dict, Any

async def get_web_search_results(query: str, professor: dict, num_results: int = 5) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Perform academic-focused web search for the given query.
    
    Args:
        query: User's search query
        professor: Professor information dictionary
        num_results: Number of results to return
        
    Returns:
        Tuple of (search_context, search_results)
    """
    try:
        ddgs = DDGS()
        
        # Create more user query-focused search queries
        academic_queries = [
            f"{query}",  # Direct user query (highest priority)
            f"{query} research papers",  # Research papers on the query topic
            f"{query} {professor['field']} latest research",  # Field-specific recent research
            f"{query} academic publications",  # Academic publications on the query
            f"{professor['name']} {query}"  # Professor's perspective on the query (lowest priority)
        ]
        
        all_results = []
        formatted_results = []
        search_context = "Relevant academic and research sources:\n\n"
        
        # Track already processed URLs to avoid duplicates
        processed_urls = set()
        
        # Perform multiple targeted searches
        for specialized_query in academic_queries:
            results = list(ddgs.text(specialized_query, max_results=4))
            
            # Process each result with BeautifulSoup
            for result in results:
                try:
                    if result.get('href') and result['href'] not in processed_urls:
                        processed_urls.add(result['href'])
                        
                        # Fetch the webpage content
                        try:
                            response = requests.get(result['href'], timeout=5)
                            soup = BeautifulSoup(response.text, 'html.parser')
                            
                            # Extract more detailed information
                            title = soup.title.string if soup.title else result.get('title', 'No title')
                            
                            # Try to get meta description
                            meta_desc = soup.find('meta', {'name': 'description'})
                            description = meta_desc['content'] if meta_desc else result.get('body', 'No description available')
                            
                            # Extract main content (customize based on common academic sites)
                            main_content = soup.find('main') or soup.find('article') or soup.find('div', {'class': ['content', 'main', 'article']})
                            
                            # Extract relevant text paragraphs
                            paragraphs = []
                            if main_content:
                                for p in main_content.find_all('p')[:3]:  # Get first 3 paragraphs
                                    paragraphs.append(p.get_text().strip())
                            
                            # Check for academic indicators
                            is_academic = any([
                                'doi.org' in result['href'],
                                'scholar.google' in result['href'],
                                'researchgate' in result['href'],
                                'academia.edu' in result['href'],
                                'arxiv.org' in result['href'],
                                '.edu' in result['href'],
                                '.ac.' in result['href'],
                                'ncbi.nlm.nih.gov' in result['href'],
                                'semanticscholar.org' in result['href']
                            ])
                            
                            # Relevance score based on keyword matching
                            query_keywords = set(query.lower().split())
                            title_keywords = set(title.lower().split())
                            desc_keywords = set(description.lower().split())
                            
                            # Calculate keyword match score
                            keyword_match_score = len(query_keywords & title_keywords) * 2 + len(query_keywords & desc_keywords)
                            
                            # Format the result with enhanced information
                            formatted_result = {
                                "title": title[:200],  # Limit title length
                                "link": result['href'],
                                "summary": description[:500],  # Limit description length
                                "content": ' '.join(paragraphs)[:1000] if paragraphs else description,  # Use extracted paragraphs if available
                                "is_academic": is_academic,
                                "relevance_score": keyword_match_score  # Add relevance score for sorting
                            }
                            
                            formatted_results.append(formatted_result)
                            
                            if len(formatted_results) >= num_results * 3:  # Collect 3x more results than needed
                                break
                                
                        except (requests.exceptions.RequestException, requests.exceptions.Timeout):
                            # Skip this result if we can't fetch the page
                            continue
                except Exception as e:
                    print(f"Error processing search result: {e}")
                    continue
            
            if len(formatted_results) >= num_results * 3:
                break
        
        # Sort results by relevance score and academic status
        formatted_results.sort(key=lambda x: (x.get('relevance_score', 0) * (2 if x.get('is_academic', False) else 1)), reverse=True)
        
        # Take top results
        top_results = formatted_results[:num_results]
        
        # Build search context for the LLM
        for i, result in enumerate(top_results):
            search_context += f"[Source {i+1}] {result['title']}\n"
            search_context += f"URL: {result['link']}\n"
            search_context += f"Summary: {result['summary']}\n"
            if result.get('content'):
                search_context += f"Content: {result['content']}\n"
            search_context += "\n"
            
            # Clean up result for the frontend
            result.pop('content', None)  # Remove content field for frontend
            result.pop('relevance_score', None)  # Remove score field
            
        return search_context, top_results
        
    except Exception as e:
        print(f"Error in web search: {e}")
        return "", [] 