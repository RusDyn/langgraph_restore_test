/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { CompiledStateGraph, END, MemorySaver, START, StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { Service } from '@tsed/di';
import { z } from 'zod';

import { Logger } from '@domain/shared';

const SearchTool = z.object({
  query: z.string().describe('query to look up online'),
  // **IMPORTANT** We are adding an **extra** field here
  // that isn't used directly by the tool - it's used by our
  // graph instead to determine whether or not to return the
  // result directly to the user
  return_direct: z
    .boolean()
    .describe('Whether or not the result of this should be returned directly to the user without you seeing what it is')
    .default(false)
});

interface AgentState {
  messages: BaseMessage[];
}

const agentState: StateGraphArgs<AgentState>['channels'] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => []
  }
};

const searchTool = new DynamicStructuredTool({
  name: 'search',
  description: 'Call to surf the web.',
  // We are overriding the default schema here to
  // add an extra field
  schema: SearchTool,
  func: async (_t: { query: string }): Promise<string> => {
    // This is a placeholder for the actual implementation
    // Don't let the LLM know this though 😊
    return 'It is sunny in San Francisco, but you better look out if you are a Gemini 😈.';
  }
});
// Define the function that determines whether to continue or not
const shouldContinue = (state: AgentState): string => {
  const { messages } = state;
  const lastMessage = messages.at(-1) as AIMessage;
  // If there is no function call, then we finish
  if (!lastMessage?.tool_calls?.length) {
    return END;
  } // Otherwise if there is, we check if it's suppose to return direct

  const { args } = lastMessage.tool_calls[0];
  if (args?.return_direct) {
    return 'final';
  }
  return 'tools';
};

const tools = [searchTool];
const toolNode = new ToolNode<{ messages: BaseMessage[] }>(tools);

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0
});
const boundModel = model.bindTools(tools);

// Define the function that calls the model
const callModel = async (state: AgentState, config?: RunnableConfig): Promise<any> => {
  const { messages } = state;
  const response = await boundModel.invoke(messages, config);
  // We return an object, because this will get added to the existing list
  return { messages: [response] };
};

/*
const prettyPrint = (message: BaseMessage) => {
  let txt = `[${message._getType()}]: ${message.content}`;
  if (((isAIMessage(message) && (message as AIMessage)?.tool_calls?.length) || 0) > 0) {
    const toolCalls = (message as AIMessage)?.tool_calls
      ?.map(tc => `- ${tc.name}(${JSON.stringify(tc.args)})`)
      .join('\n');
    txt += ` \nTools: \n${toolCalls}`;
  }
  console.log(txt);
}; */

@Service()
export class LangGraphService {
  public async $onInit(): Promise<void> {
    Logger.info('Done');

    const workflow = new StateGraph({ channels: agentState })
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');
    // .addEdge('final', END);

    // Finally, we compile it!
    const memory = new MemorySaver();
    const app = workflow.compile({
      checkpointer: memory,
      interruptBefore: ['tools']
    });

    const config = { configurable: { thread_id: 'conversation-num-1' } };

    const inputs = { messages: [new HumanMessage('what is the weather in sf')] };

    const breakOnTool = await this.processWorkflow(config, inputs, app);
    if (breakOnTool) {
      const { name, args, id } = breakOnTool;
      console.log(name, args, id);
      /// here we can break and go back later
      /// we need to store thread_id, name, tool_call_id. and result will be from handler

      await this.updateAndProcess(config, app, name, id, 'It is rainy in San Francisco today 😈.');
    }

    process.exit();
  }

  private async updateAndProcess(
    config: { configurable: { thread_id: string } | { thread_id: string } },
    app: CompiledStateGraph<AgentState, Partial<Record<'messages', any>>, '__start__' | 'agent' | 'tools'>,
    name: string,
    toolCallId: string,
    content: string
  ): Promise<{ name: string; args: Record<string, any>; id: string } | null> {
    await app.updateState(
      config,
      {
        messages: [
          new ToolMessage({
            content,
            name,
            tool_call_id: toolCallId
          })
        ]
      },
      'tools'
    );
    return this.processWorkflow(config, null, app);
  }

  private async processWorkflow(
    config: { configurable: { thread_id: string } },
    inputs: any | null,
    app: CompiledStateGraph<AgentState, Partial<Record<'messages', any>>, '__start__' | 'agent' | 'tools'>
  ): Promise<{ name: string; args: Record<string, any>; id: string } | null> {
    let finishReason = 'not stop';
    let inputs2 = inputs;
    while (finishReason !== 'stop') {
      const outputs = await app.stream(inputs2, { ...config, streamMode: 'values' });
      for await (const output of outputs) {
        const lastMessage: BaseMessage = output.messages.at(-1);
        finishReason = lastMessage?.response_metadata?.finish_reason;
        const toolCalls2 = (lastMessage as AIMessage).tool_calls;

        if (toolCalls2 && toolCalls2.length > 0) {
          const toolCall = toolCalls2![0];
          const { name, args, id } = toolCall;
          return { name, args, id: id! };
        }
      }
      inputs2 = null;
    }
    return null;
  }
}
