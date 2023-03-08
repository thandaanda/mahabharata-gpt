export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type MBSection = {
  chapter_num: number;
  chapter_title: string;
  content: string;
  content_length: number;
  content_tokens: number;
  chunks: MBChunk[];
};

export type MBChunk = {
  chapter_num: number;
  chapter_title: string;
  chunk_num: number;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type MBBook = {
  book_title: string;
  author: string;
  book_url: string;
  publication_date: string;
  current_date: string;
  length: number;
  tokens: number;
  sections: MBSection[];
};
