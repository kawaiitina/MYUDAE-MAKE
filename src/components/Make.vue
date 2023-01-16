<script setup>
import { ref, onMounted, computed } from "vue";
import Score from "/src/modules/make.js";
import Youtube from "./Youtube.vue";

const score = ref(new Score());
let beatPerMeasure = ref(16);
let loadStr = ref("");

let dragStart = null;
const TOP = "top";
const BOTTOM = "bottom";
const scoreString = computed(() => {
  return score.value.toString();
});

function handleclick(lane, beat, subbeat) {
  score.value.addNote(lane, beat * 12 + (subbeat * 48) / beatPerMeasure.value);
}
function handleContextmenu(lane, beat, subbeat) {
  score.value.deleteNote(
    lane,
    beat * 12 + (subbeat * 48) / beatPerMeasure.value
  );
  score.value.deleteLongNote(
    lane,
    beat * 12 + (subbeat * 48) / beatPerMeasure.value
  );
}

function handleDragstart(lane, beat, subbeat) {
  dragStart = { lane, beat, subbeat };
}
function handleDrop(lane, beat, subbeat) {
  const dragStartBeat =
    dragStart.beat * 12 + (dragStart.subbeat * 48) / beatPerMeasure.value;
  const dragEndBeat = beat * 12 + (subbeat * 48) / beatPerMeasure.value;
  if (dragStartBeat > dragEndBeat) {
    score.value.addLongNote(lane, dragEndBeat, dragStartBeat);
  } else {
    score.value.addLongNote(lane, dragStartBeat, dragEndBeat);
  }
  dragStart = null;
}

function handleBarClick(beat) {
  score.value.toggleBar(beat);
}

function copyToClipboard() {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = score.value.toString();
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function handleKeydown(event) {
  if (event.repeat) {
    return;
  }
  if (event.code === "Insert") {
    score.value.addBeat(4);
  } else if (event.code === "Delete") {
    score.value.deleteBeat(1);
  } else if (event.code === "Tab") {
    beatPerMeasure.value = beatPerMeasure.value === 16 ? 24 : 16;
  }
}

const youtubeDialog = ref(false);

onMounted(() => {
  document.body.addEventListener("keydown", handleKeydown);

  document.querySelector("#score").addEventListener("wheel", function (event) {
    event.preventDefault();
    this.scrollLeft += (event.deltaY / 100) * 200;
  });
  if (localStorage.getItem("save")) {
    score.value.load(localStorage.getItem("save"));
  }
});
</script>

<template>
  <div class="row q-gutter-md q-pa-md">
    <q-input v-model="score.title" label="제목" />
    <q-input v-model="score.artist" label="아티스트" />
    <q-input v-model.number="score.bpm" type="number" label="BPM" />
    <q-input v-model="score.src" label="유튜브 id" />
    <q-input
      v-model.number="score.offset"
      type="number"
      label="음악 시작 시간 (초)"
    />
  </div>

  <div id="score" class="column" @contextmenu.prevent="">
    <div class="row no-wrap">
      <div
        v-for="beat in score.beats"
        class="bar"
        :class="score.bars.includes(beat - 1) ? 'bar-red' : 'bar-gray'"
        :style="`left: ${393 + (beat - 1) * 192}px;`"
        @click="handleBarClick(beat - 1)"
      ></div>
      <template v-for="beat in score.beats">
        <div class="beat row items-center">
          <div
            class="note-button"
            draggable="true"
            v-for="subbeat in beatPerMeasure / 4"
            @click="handleclick(TOP, beat - 1, subbeat - 1)"
            @contextmenu="handleContextmenu(TOP, beat - 1, subbeat - 1)"
            @dragstart="handleDragstart(TOP, beat - 1, subbeat - 1)"
            @drop="handleDrop(TOP, beat - 1, subbeat - 1)"
            @dragover.prevent=""
            :style="`margin-right: ${beatPerMeasure === 16 ? 24 : 8}px`"
          ></div>
        </div>
      </template>
      <template v-for="note in score.notes[TOP]">
        <div
          class="note-top"
          :style="`left: ${384 + (192 / 12) * note}px`"
        ></div>
      </template>
      <template v-for="longNote in score.longNotes[TOP]">
        <div
          class="longnote-top"
          :style="`left: ${384 + (192 / 12) * longNote.start}px; width: ${
            (192 / 12) * (longNote.end - longNote.start) + 24
          }px`"
        ></div>
      </template>
    </div>
    <div class="row no-wrap">
      <template v-for="beat in score.beats">
        <div class="beat row items-center">
          <div
            class="note-button"
            draggable="true"
            v-for="subbeat in beatPerMeasure / 4"
            @click="handleclick(BOTTOM, beat - 1, subbeat - 1)"
            @contextmenu="handleContextmenu(BOTTOM, beat - 1, subbeat - 1)"
            @dragstart="handleDragstart(BOTTOM, beat - 1, subbeat - 1)"
            @drop="handleDrop(BOTTOM, beat - 1, subbeat - 1)"
            @dragover.prevent=""
            :style="`margin-right: ${beatPerMeasure === 16 ? 24 : 8}px`"
          ></div>
        </div>
      </template>
      <template v-for="note in score.notes[BOTTOM]">
        <div
          class="note-bottom"
          :style="`left: ${384 + (192 / 12) * note}px`"
        ></div>
      </template>
      <template v-for="longNote in score.longNotes[BOTTOM]">
        <div
          class="longnote-bottom"
          :style="`left: ${384 + (192 / 12) * longNote.start}px; width: ${
            (192 / 12) * (longNote.end - longNote.start) + 24
          }px`"
        ></div>
      </template>
    </div>
    <div class="row beat-index-container">
      <div v-for="beat in score.beats" class="beat-index">
        <span class="text-h6 cursor-pointer" @click="handleBarClick(beat - 1)">
          {{ beat - 1 }}
        </span>
      </div>
    </div>
  </div>

  <q-card class="q-ma-md">
    <q-card-section>
      좌클릭/드래그: 노트 삽입<br />우클릭: 노트 삭제<br />
      insert: 마디 삽입<br />delete: 한 박자 삭제 <br />
      tab: 16비트/24비트 전환<br />
      두 겹 노트 입력하는 방법: 1칸짜리 롱노트 + 일반 노트
    </q-card-section>
    <q-separator />
    <q-card-section class="row q-gutter-md">
      <div class="column">
        <q-input
          outlined
          v-model="scoreString"
          label="내보내기"
          type="textarea"
        />
        <q-btn
          color="white"
          text-color="black"
          label="복사"
          @click="copyToClipboard"
        />
      </div>
      <div class="column">
        <q-input outlined v-model="loadStr" label="불러오기" type="textarea" />
        <q-btn
          color="white"
          text-color="black"
          label="불러오기"
          @click="score.load(loadStr)"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="column">
        <q-btn
          color="white"
          text-color="black"
          label="초기화"
          @click="score.reset()"
        />
      </div>
    </q-card-section>

    <q-separator />
    <q-card-section>
      <q-btn label="유튜브 플레이어 보기" @click="youtubeDialog = true" />
    </q-card-section>
  </q-card>
  <q-dialog v-model="youtubeDialog">
    <Youtube :id="score.src" />
  </q-dialog>
</template>

<style scoped>
#score {
  position: relative;
  border-radius: 12px;
  max-width: 100%;
  overflow: scroll;
  padding-left: 384px;
  padding-right: 384px;
  background-color: #fafafa;
}
.bar {
  width: 2px;
  height: 192px;
  position: absolute;
}
.bar-red {
  background-color: #dc143c;
}
.bar-gray {
  background-color: #d3d3d3;
}
.beat {
  width: 192px;
  min-width: 192px;
  height: 96px;
  position: relative;
}
.note-button {
  width: 24px;
  height: 48px;
  border-radius: 12px;
  background-color: #e8e8e8;
  cursor: pointer;
}
.note-button:hover {
  background-color: #d3d3d3;
}
.note-button-top-on {
  background-color: DeepSkyBlue;
}

.note-top {
  position: absolute;
  top: 24px;
  width: 24px;
  height: 48px;
  border-radius: 12px;
  pointer-events: none;
  outline: DeepSkyBlue solid 4px;
}
.longnote-top {
  position: absolute;
  top: 24px;
  height: 48px;
  border-radius: 12px;
  opacity: 0.5;
  pointer-events: none;
  background-color: DeepSkyBlue;
}
.note-bottom {
  position: absolute;
  top: 120px;
  width: 24px;
  height: 48px;
  border-radius: 12px;
  /* opacity: 0.6; */
  pointer-events: none;
  /* background-color: HotPink; */
  outline: HotPink solid 4px;
}
.longnote-bottom {
  position: absolute;
  top: 120px;
  height: 48px;
  border-radius: 12px;
  opacity: 0.5;
  pointer-events: none;
  background-color: HotPink;
}
.blue {
  background-color: DeepSkyBlue;
}
.pink {
  background-color: HotPink;
}
.beat-index-container {
  height: 48px;
}
.beat-index {
  width: 192px;
}
</style>
