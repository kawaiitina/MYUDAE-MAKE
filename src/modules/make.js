// beat는 12등분
// 1마디(4박자)는 48등분

export default class Score {
  constructor() {
    this.title = "";
    this.artist = "";
    this.bpm = 0;
    this.src = "";
    this.videoStartTime = 0;
    this.beats = 16;
    this.notes = { top: [], bottom: [] };
    this.longNotes = { top: [], bottom: [] };
    this.bars = [0, 4, 8, 12];
  }
  addNote(lane, beat) {
    const index = this.notes[lane].findIndex((note) => note === beat);
    if (index !== -1) {
      return;
    }
    this.notes[lane].push(beat);
    this.notes[lane].sort((a, b) => a - b);

    this.save();
  }
  deleteNote(lane, beat) {
    const index = this.notes[lane].findIndex((note) => note === beat);
    if (index === -1) {
      return;
    }
    this.notes[lane].splice(index, 1);

    this.save();
  }
  addLongNote(lane, startBeat, endBeat) {
    this.longNotes[lane].push([startBeat, endBeat]);
    this.longNotes[lane].sort((a, b) => a[0] - b[0]);

    this.save();
  }
  deleteLongNote(lane, beat) {
    const index = this.longNotes[lane].findIndex((longNote) => {
      return longNote[0] === beat || longNote[1] === beat;
    });
    if (index === -1) {
      return;
    }
    this.longNotes[lane].splice(index, 1);

    this.save();
  }
  toggleBar(beat) {
    const index = this.bars.findIndex((bar) => bar === beat);
    if (index !== -1) {
      this.bars.splice(index, 1);
    } else {
      this.bars.push(beat);
    }
    this.bars.sort((a, b) => a - b);

    this.save();
  }
  addBeat(howmany) {
    this.bars.push(this.beats);
    this.beats += howmany;

    this.save();
  }
  deleteBeat(howmany) {
    this.beats -= howmany;
    let index = this.bars.findIndex((bar) => bar > this.beats - 1);
    while (index !== -1) {
      this.bars.splice(index, 1);
      index = this.bars.findIndex((bar) => bar > this.beats - 1);
    }

    index = this.notes.top.findIndex((note) => note > (this.beats - 1) * 12);
    while (index !== -1) {
      this.notes.top.splice(index, 1);
      index = this.notes.top.findIndex((note) => note > (this.beats - 1) * 12);
    }
    index = this.notes.bottom.findIndex((note) => note > (this.beats - 1) * 12);
    while (index !== -1) {
      this.notes.bottom.splice(index, 1);
      index = this.notes.bottom.findIndex(
        (note) => note > (this.beats - 1) * 12
      );
    }
    index = this.longNotes.top.findIndex(
      (longNote) => longNote[1] > (this.beats - 1) * 12
    );
    while (index !== -1) {
      this.longNotes.top.splice(index, 1);
      index = this.longNotes.top.findIndex(
        (longNote) => longNote[1] > (this.beats - 1) * 12
      );
    }
    index = this.longNotes.bottom.findIndex(
      (longNote) => longNote[1] > (this.beats - 1) * 12
    );
    while (index !== -1) {
      this.longNotes.bottom.splice(index, 1);
      index = this.longNotes.bottom.findIndex(
        (longNote) => longNote[1] > (this.beats - 1) * 12
      );
    }

    this.save();
  }
  toString() {
    return JSON.stringify({
      title: this.title,
      artist: this.artist,
      bpm: this.bpm,
      src: this.src,
      videoStartTime: this.videoStartTime,
      beats: this.beats,
      notes: this.notes,
      longNotes: this.longNotes,
      bars: this.bars,
    });
  }
  save() {
    localStorage.setItem("save", this.toString());
  }
  load(str) {
    const parsed = JSON.parse(str);
    this.title = parsed.title;
    this.artist = parsed.artist;
    this.bpm = parsed.bpm;
    this.src = parsed.src;
    this.videoStartTime = parsed.videoStartTime;
    this.beats = parsed.beats;
    this.notes = parsed.notes;
    this.longNotes = parsed.longNotes;
    this.bars = parsed.bars;
  }
  reset() {
    if (confirm("악보를 초기화할까요?")) {
      this.beats = 16;
      this.notes = { top: [], bottom: [] };
      this.longNotes = { top: [], bottom: [] };
      this.bars = [0, 4, 8, 12];
      this.save();
    }
  }
  resetAll() {
    if (confirm("초기화할까요?")) {
      this.title = "";
      this.artist = "";
      this.bpm = 0;
      this.src = "";
      this.videoStartTime = 0;
      this.beats = 16;
      this.notes = { top: [], bottom: [] };
      this.longNotes = { top: [], bottom: [] };
      this.bars = [0, 4, 8, 12];
      this.save();
    }
  }
}
