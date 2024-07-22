import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { ChatOpenAI } from '@langchain/openai';
import { Inject, Service } from '@tsed/di';
import OpenAI from 'openai';

import { DatabaseService } from '../database/database.service';
import { LLMConfig } from '../shared/config';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);




@Service()
export class AIService {

  @Inject()
  protected databaseService: DatabaseService;

  private model: ChatOpenAI;

  private openai: OpenAI;

  public $onInit(): void {
    this.model = new ChatOpenAI({
      apiKey: LLMConfig.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0
    });

    this.openai = new OpenAI({
      apiKey: LLMConfig.OPENAI_API_KEY
    });

    this.model;
  }

  public async getText(base64Audio: string): Promise<string> {
    const temporaryFilePath = join(tmpdir(), `audio-${Date.now()}.mp3`);
    try {
      // Decode base64 string to binary data
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      // Write the buffer to a temporary file
      await writeFile(temporaryFilePath, audioBuffer);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (!fs.existsSync(temporaryFilePath)) {
        throw new Error(`File ${temporaryFilePath} not found`);
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const audioFile = fs.createReadStream(temporaryFilePath);
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1'
      });

      return transcription.text;
    } finally {
      // Ensure the temporary file is deleted after processing
      await unlink(temporaryFilePath);
    }
  }
}
