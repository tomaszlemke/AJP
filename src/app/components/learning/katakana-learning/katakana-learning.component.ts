import { Component, OnInit } from '@angular/core';
import {KanaService} from "../../../services/kana.service";
import {Kana} from "../../../models/kana.model";
import {map} from "rxjs/operators";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {UserService} from "../../../services/user.service";
import {UserModel} from "../../../models/user.model";

@Component({
  selector: 'app-katakana-learning',
  templateUrl: './katakana-learning.component.html',
  styleUrls: ['./katakana-learning.component.css']
})
export class KatakanaLearningComponent implements OnInit {

  userData: any; // Save logged in user data
  currentUser?: UserModel;

  katakanaQuizArray: Kana[] = [];
  katakanaLearnArray: Kana[] = [];
  nineAnswers: Kana[] = [];
  allKatakanaList: Kana[] = [];
  result = '';
  icon = '';
  numberAnswered = 0;
  numberAnsweredCorrect = 0;
  sortedIdArray: number[] = [];
  sortedIdArrayIndex = 0;
  randomizedIdArray: number[] = [];
  randomizedIdArrayIndex = 0;
  answered = false;
  learningEnd = false;
  quizStart = false;
  quizEnd = false;
  doLevelUp: any;
  progressBar: number = 0;

  constructor(private kanaService: KanaService, public afAuth: AngularFireAuth, private userService: UserService) {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.userData = user;
        this.retrieveUserDocumentById(user.uid);
      }
      else {
        console.log("User failed to load");
      }
    });
  }

  ngOnInit(): void {
    for (let v of this.kanaService.idSetList) {
      this.sortedIdArray.push(v);
    }

    this.randomizedIdArray.push(...this.sortedIdArray);
    this.randomizedIdArray.push(...this.sortedIdArray);
    this.shuffleArray(this.randomizedIdArray);
    this.getAllKatakana();
    this.progressBar = 0;

    this.kanaService.currentLevelUpValue.subscribe(value => this.doLevelUp = value);
    console.log("levelUp onInit: ", this.doLevelUp);
    console.log(this.sortedIdArray);
    console.log(this.randomizedIdArray);
  }

  getAllKatakana(): void {
    this.kanaService.getAllKatakana().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data()})
        )
      )
    ).subscribe(data => {
      this.allKatakanaList = data;
    });
  }

  retrieveUserDocumentById(userId: string): void {
    this.userService.getSingleUserDocumentById(userId).ref.get()
      .then((result) => {
        this.currentUser = result.data()
      });
  }

  checkAnswerType(type: string): boolean {
    return this.currentUser?.answerType == type;
  }

  checkNumberOfColumns(): number {
    if (this.currentUser?.answerType == 'input')
      return 1
    else
      return 2
  }

  prepareAnswers(id: Kana[]) {
    this.nineAnswers.splice(0);
    const katakanaIdSet = new Set<number>();
    katakanaIdSet.add(this.randomizedIdArray[this.randomizedIdArrayIndex])

    while (katakanaIdSet.size < 9) {
      katakanaIdSet.add(Math.floor(Math.random() * 107) + 1)
    }

    console.log("katakanaIdSet from prepareAnswers: ", katakanaIdSet)

    katakanaIdSet.forEach( (value) => {
      const firstKatakana = id.find((katakana) => {
        return katakana.id == value.toString()})
      this.nineAnswers.push(firstKatakana!)
    })

    this.shuffleArray(this.nineAnswers)
  }

  //The Fisher-Yates algorithm
  shuffleArray(array: Array<any>): Array<any> {
    let m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  levelUp(): void {
    this.currentUser!.progressKatakana.learningLevel += 1;
    this.userService.updateUserProgressKatakana(this.currentUser!.uid, this.currentUser!.progressKatakana);
  }

  learnSession(id: number): void {
    this.sortedIdArrayIndex += 1;

    if (this.sortedIdArrayIndex <= this.sortedIdArray.length) {
      this.kanaService.getSingleKatakanaById(id).snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({id: c.payload.doc.id, ...c.payload.doc.data()})
          )
        )
      ).subscribe(data => {
        this.katakanaLearnArray = data;
      });
    }
    else {
      this.quizStart = true;
      this.answered = false;
      this.learningEnd = true;
      this.result = '';
      this.icon = '';
      this.katakanaLearnArray.splice(0, this.katakanaLearnArray.length);
      this.kanaService.getSingleKatakanaById(id).snapshotChanges().pipe(
        map(changes =>
          changes.map(c =>
            ({id: c.payload.doc.id, ...c.payload.doc.data()})
          )
        )
      ).subscribe(data => {
        this.katakanaQuizArray = data;
      });
      this.prepareAnswers(this.allKatakanaList)
    }
  }

  answering(answer: string, reading: string) {
    this.answered = !this.answered;

    if (reading == answer) {
      this.result = "Poprawna odpowiedź";
      this.icon = "check_circle"
      this.randomizedIdArray.splice(this.randomizedIdArrayIndex, 1);
      this.numberAnswered = this.numberAnswered + 1
      this.numberAnsweredCorrect = this.numberAnsweredCorrect + 1
      console.log("index when correct = " + this.randomizedIdArrayIndex);
      console.log(this.randomizedIdArray)
    }
    else {
      this.result = "Zła odpowiedź";
      this.icon = "cancel";
      this.numberAnswered = this.numberAnswered + 1
      this.randomizedIdArrayIndex++;
      console.log("index when fail = " + this.randomizedIdArrayIndex);
      console.log(this.randomizedIdArray)
    }

    if (this.randomizedIdArrayIndex >= this.randomizedIdArray.length)
      this.randomizedIdArrayIndex = 0;

    if (!this.randomizedIdArray.length) {
      this.quizEnd = true;
      if (this.doLevelUp) {
        this.levelUp();
      }
    }

    this.progressBar = ((this.numberAnsweredCorrect / this.sortedIdArray.length) / 2) * 100
  }

  score(correct: number, total: number): number{
    return correct / total
  }

}
