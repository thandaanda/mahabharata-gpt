--  RUN 1st
create extension vector;

-- RUN 2nd
create table mb (
  id bigserial primary key,
  chapter_title text,
  chapter_num bigint,
  chunk_num bigint,
  content text,
  content_length bigint,
  content_tokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function mb_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  chapter_title text,
  chapter_num bigint,
  chunk_num bigint,
  content text,
  content_length bigint,
  content_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    mb.id,
    mb.chapter_title,
    mb.chapter_num,
    mb.chunk_num,
    mb.content,
    mb.content_length,
    mb.content_tokens,
    1 - (mb.embedding <=> query_embedding) as similarity
  from mb
  where 1 - (mb.embedding <=> query_embedding) > similarity_threshold
  order by mb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on mb 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);