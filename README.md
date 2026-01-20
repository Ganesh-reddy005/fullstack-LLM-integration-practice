# Practising Full stack development with LLM Integration
  
## Tech Stack  
**Frontend** - Next.js, tailwind, Typescript  
**Backend** - FastAPI  

## **Learning's** - 
- when you get any error from server side -> ex: internal error 500. Always go to */docs* to trace error easily  
- learnt about FastAPI, async vs sync  
- FastAPI -> CROS - cross origin resource sharing  
- Importing correct Async , ex from openai import AsyncOpenAI  
- Sending requst from frontend to backend  
- We use - ip adress of servers (2 servers => 1.Frontend 2.Backend) to exchange the data   
  
## Context Window Management:  
### 1 My Simplest Approach  
- Tried a simple method -> Pass `last K questions of USER's` to LLM (storing each new question and appending to previous one)      
*Pros*  
* LLM can understand what it's going through  
* Less Token Usage (as we are onlying passing only feq tokens and not entier Conversation)  
* Speed   

*Cons*  
* Our LLM may give same output without properly understanding user completely   
* Not having 'complete context' of the chat/queries   
  
### 2. Sliding Window / Truncated Context:  
* I know we can pass past ` k messages` directly into LLM for better response.    
*Cons*   
* More Number of token therefore more API credits will be used  
* Latency - might git slow , when LLM response to too big  
  
### 3. RAG - Retrieval Augmented Generation  
* This is one the most important Frameworks/system in AI  
* Ued when LLM needed to recollect from a knowladge base  
* we chunk the data (using chunking strategies) an store in `Vector DB`  
**But for our Use case it would be too much initally, beacuse we dont produce a lot of data**  

### 4. My Approach - Summarization of Past Context:   
* Once we get LLM response, we will use a SLM (Small Language Model) to Quickly summarise.  
* Now we can pass this ` Summarised ` text into LLM    
*Pros*  
* Less API credits used, SLM bearly use much credits ex - GPT 5 Nano price - $0.05/1M (Input) - $0.4/1M (Output)  
* Speed - as we only pass summary of the LLM response (` Less output Token's from Nano model `)  
* Context - Now Our LLM can understand Context Much Better    

### 5. Hierarchical Context Management
* we store data based on importance and facts - layers   
* Immediate context - last few turns  
* Session summary - high-level recap  
* Persistent memory - facts about the user, e.g., “Ganesh is a CS student”    

**But For Our Use Case in V1 We can go with 2nd, 4th or 5th one**   


## Modularity   
* Very important to have seperate isolated functions/scripts   
* Easy to Maintain, Scale, Debug, Add or Remove Functionality etc.  

        
## Backend
* Using MongoDB - best fit for our use case
**Beanie**   
- A Python ODM (Object-Document Mapper) for MongoDB.  
- Lets you define MongoDB collections as Pydantic models (Python classes).  