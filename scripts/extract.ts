import { MBChunk, MBSection } from "@/types";
import { readFileSync, writeFileSync } from "fs";
import pdfParse from "pdf-parse"
import { encode } from "gpt-3-encoder";

const CHUNK_SIZE = 200;

export const getTextContentFromPDF = async (pdfBuffer: Buffer) => {
  const { text, numpages, info } = await pdfParse(pdfBuffer)
  return text
}

export const getChaptersFromText = (text: string) => {
  // remove till the second occurence of "1. GANAPATI, THE SCRIBE" but keep the second occurence of "1. GANAPATI, THE SCRIBE"
  text = text.split("1. GANAPATI, THE SCRIBE")[1];

  text = "1. GANAPATI, THE SCRIBE \n" + text;
  
  // get all the chapter titles having format "1. GANAPATI, THE SCRIBE"
  const chapterTitles = text.match(/(\d+\. .+)/g)
  // console.log(chapterTitles);
  const chapters = chapterTitles?.map((title, index) => {
    const chapterNum = +title.split(".")[0]
    const chapterTitle = title.split(".")[1].trim()
    const chapterText = text.split(title)[1].split(chapterTitles[index + 1] || "End of the book")[0]
    console.log(`Processing chapter with index ${index} ${chapterNum} - ${chapterTitle} - ${chapterText.length} characters`)
    const section: MBSection = {
      chapter_num: chapterNum,
      chapter_title: chapterTitle,
      content: chapterText,
      content_length: chapterText.length,
      content_tokens: encode(chapterText).length,
      chunks: []
    };
    return section;
  }) || [];
  return chapters;
}

const chunkSection = async (section: MBSection) => {
  const { chunks, content, ...chunklessSection } = section;

  let sectionTextChunks = [];

  if (encode(content).length > CHUNK_SIZE) {
    const split = content.split(". ");
    let chunkText = "";

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence);
      const chunkTextTokenLength = encode(chunkText).length;

      if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
        sectionTextChunks.push(chunkText);
        chunkText = "";
      }

      if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    }

    sectionTextChunks.push(chunkText.trim());
  } else {
    sectionTextChunks.push(content.trim());
  }

  const sectionChunks = sectionTextChunks.map((text) => {
    const trimmedText = text.trim();

    const chunk: MBChunk = {
      ...chunklessSection,
      content: trimmedText,
      content_length: trimmedText.length,
      content_tokens: encode(trimmedText).length,
      chunk_num: 0, // handled in embed.ts
      embedding: []
    };

    return chunk;
  });

  if (sectionChunks.length > 1) {
    for (let i = 0; i < sectionChunks.length; i++) {
      const chunk = sectionChunks[i];
      const prevChunk = sectionChunks[i - 1];

      if (chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += " " + chunk.content;
        prevChunk.content_length += chunk.content_length;
        prevChunk.content_tokens += chunk.content_tokens;
        sectionChunks.splice(i, 1);
        i--;
      }
    }
  }

  const chunkedSection: MBSection = {
    ...section,
    chunks: sectionChunks
  };

  return chunkedSection;
};


(async () => {
  const pdfBuffer = readFileSync("mahabharata.pdf")
  const text = await getTextContentFromPDF(pdfBuffer)
  const chapters = getChaptersFromText(text)
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    console.log(`Processing chapter ${chapter.chapter_num} - ${chapter.chapter_title}`)
    const chunkedChapter = await chunkSection(chapter)
    // replace the chapter with the chunked chapter
    chapters[i] = chunkedChapter;
  }

  const book = {
    book_title: "Mahabharata",
    author: "Vyasa",
    book_url: "https://en.wikipedia.org/wiki/Mahabharata",
    publication_date: "2022-07-04",
    current_date: "2023-03-01",
    length: chapters.reduce((acc, section) => acc + section.content_length, 0),
    tokens: chapters.reduce((acc, section) => acc + section.content_tokens, 0),
    sections: chapters
  };

  writeFileSync("scripts/mahabharata.json", JSON.stringify(book, null, 2))
})();