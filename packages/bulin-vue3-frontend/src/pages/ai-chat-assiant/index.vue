<template>
  <div class="ai-chat-assiant w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page"></span>
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn"></i>
          AI聊天助手
        </span>
      </div>
    </div>
    <div class="container overflow-hidden w-100 h-100 flex-fill">
      <div class="d-flex h-100 gap-3">
        <el-card class="flex-shrink-0">
          <el-input class="question-input w-100 h-100" :maxlength="100" show-word-limit
            @keydown.enter.prevent="submitMessage" v-model="question" type="textarea" :rows="10" placeholder="请输入内容" />
          <el-button class="w-100 mt-2" type="primary" @click="submitMessage">
            发送
          </el-button>
        </el-card>
        <el-card body-class=" px-0 py-4  overflow-hidden h-100" class="overflow-hidden flex-fill">
          <div @wheel="wheelEvt" class="scroll-container mh-100  overflow-y-auto">
            <div class="message-list-container" v-if="messageList.length">
              <div class="message-item px-4 mt-4" :class="{ 'in-answering': message.inAnswering }"
                v-for="message in messageList">
                <div class="user-question d-flex justify-content-end">
                  <div class="w-50 text-end">{{ message.question }}</div>
                </div>
                <div class="ai-answer mt-2">
                  <div class="ai-answer-content" v-html="getMarkedAnswer(message.answer)"></div>
                  <div v-if="!message.inAnswering" class=" d-flex justify-content-end ">
                    <el-tooltip content="重新生成" placement="top">
                      <span class="text-primary cursor-pointer" @click="regenerate(message)">
                        <el-icon>
                          <Refresh />
                        </el-icon>
                      </span>
                    </el-tooltip>
                    <el-tooltip content="修改" placement="top">
                      <span class="text-primary cursor-pointer" @click="rewrite(message)">
                        <el-icon>
                          <Edit />
                        </el-icon>
                      </span>
                    </el-tooltip>
                  </div>
                </div>
                <el-divider v-if="message.answer && message.answer" border-style="dashed" class="my-3"></el-divider>
              </div>
            </div>
          </div>
        </el-card>
      </div>

    </div>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, reactive, ref } from 'vue';
import { Refresh, Edit } from '@element-plus/icons-vue';
import OpenAI from 'openai';
import { messageList, goToBottom, useObserveAnswering, cachedData, wheelEvt, focusInput, getMarkedAnswer, } from './page';

defineOptions({
  name: 'AiChatAssiant'
});

const client = new OpenAI({
  apiKey: "sk-5cc5Pqit9escnNduo4Ard0oCxpmbnh23MDVWWYSpj7vHsZmQ",
  baseURL: location.origin + '/chat',
  dangerouslyAllowBrowser: true
});

const question = ref('');

const { startObserve, stopObserve } = useObserveAnswering();

const chatHandler = async ({ question }) => {
  Object.assign(cachedData, { hasScroll: false });
  const inAnsweringMessage = messageList.find(m => m.inAnswering === true);
  try {
    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [{ role: 'user', content: question }],
      temperature: 0.3,
      stream: true
    });


    if (!inAnsweringMessage) {
      return;
    }
    for await (let chunk of completion) {
      // 在这里，每个 chunk 的结构都与之前的 completion 相似，但 message 字段被替换成了 delta 字段
      const delta = chunk.choices[0].delta // <-- message 字段被替换成了 delta 字段
      if (delta.content) {
        // 我们在打印内容时，由于是流式输出，为了保证句子的连贯性，我们不人为地添加
        // 换行符，因此通过设置 end="" 来取消 print 自带的换行符。
        inAnsweringMessage.answer += delta.content;
      }
    }
    Reflect.deleteProperty(inAnsweringMessage, 'inAnswering');
    focusInput()
  } catch (error) {
    inAnsweringMessage.answer = 'AI助手出错了，请稍后再试。';
  } finally {
    Object.assign(inAnsweringMessage, { inAnswering: false });
  }
}

// 重新生成
const regenerate = (data) => {
  Object.assign(data, { inAnswering: true, answer: ' ' });
  chatHandler({ question: data.question });
}

// 修改
const rewrite = (data) => {
  question.value = data.question;
  focusInput();
}

// 提问
const submitMessage = async () => {
  if (!question.value?.trim()) {
    return;
  }
  const chatOptin = {
    question: question.value,
    inAnswering: true,
    answer: ''
  };
  question.value = '';
  nextTick(goToBottom);
  messageList.push(chatOptin);
  chatHandler({ question: chatOptin.question });
}

</script>
<style lang="scss" scoped>
.ai-chat-assiant {
  .scroll-container {
    &::-webkit-scrollbar {
      display: none;
      /* 隐藏滚动条 */
    }
  }

  .ai-answer {
    text-indent: 24px;

    .ai-answer-content {}
  }
}
</style>
