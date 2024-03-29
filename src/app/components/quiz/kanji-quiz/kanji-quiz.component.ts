import { Component, OnInit } from '@angular/core';
import {Kanji} from "../../../models/kanji.model";
import {ActivatedRoute} from "@angular/router";
import {KanaService} from "../../../services/kana.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {UserService} from "../../../services/user.service";
import {map} from "rxjs/operators";
import {UserModel} from "../../../models/user.model";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-kanji-quiz',
  templateUrl: './kanji-quiz.component.html',
  styleUrls: ['./kanji-quiz.component.css']
})
export class KanjiQuizComponent implements OnInit {

  userData: any; // Save logged in user data
  currentUser?: UserModel;

  nineAnswers: Kanji[] = [];
  kanjiArray: Kanji[] = [];
  allKanjiList: Kanji[] = [];
  result = '';
  icon = '';
  routeParam: number = 0;
  numberAnswered = 0;
  numberAnsweredCorrect = 0;
  idArray: number[] = [];
  answered = false;
  quizStart = false;
  quizEnd = false;
  doLevelUp: any;
  progressBar: number = 0;

  constructor(private route: ActivatedRoute, private kanaService: KanaService, public afAuth: AngularFireAuth,
              private userService: UserService, public dialog: MatDialog) {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        this.userData = user;
        this.retrieveUserDocumentById(user.uid);
      } else {
        console.log("User failed to load");
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.routeParam = params['level'];
    });
    this.kanaService.currentLevelUpValue.subscribe(value => this.doLevelUp = value);
    console.log("levelUp onInit: ", this.doLevelUp)
    this.generateArray(this.routeParam)
    this.getAllKanji()
    this.progressBar = 0;
  }

  getAllKanji(): void {
    this.kanaService.getAllKanji().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data()})
        )
      )
    ).subscribe(data => {
      this.allKanjiList = data;
    });
  }


  retrieveUserDocumentById(userId: string): void {
    this.userService.getSingleUserDocumentById(userId).ref.get()
      .then((result) => {
        this.currentUser = result.data();
      });
  }

  generateArray(level: number) {
    if (level == 1) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 1);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 2) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 11);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 3) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 21);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 4) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 31);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 5) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 41);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 6) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 51);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 7) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 61);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    } else if (level == 8) {
      this.idArray = Array.from({length: 10}, (_, i) => i + 71);
      this.shuffleArray(this.idArray)
      console.log("arr: ", this.idArray);
    }
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

  prepareAnswers(id: Kanji[]) {
    this.nineAnswers.splice(0);
    const kanjiIdSet = new Set<number>();
    kanjiIdSet.add(this.idArray[this.numberAnswered])

    while (kanjiIdSet.size < 9) {
      kanjiIdSet.add(Math.floor(Math.random() * (this.routeParam * 10)) + 1)
    }

    console.log("kanjiIdSet from prepareAnswers: ", kanjiIdSet)

    kanjiIdSet.forEach( (value) => {
      const firstKanji = id.find((kanji) => {
        return kanji.id == value.toString()})
      this.nineAnswers.push(firstKanji!)
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

  signProgressUp(): void {
    if ((this.score(this.numberAnsweredCorrect, this.numberAnswered) == 1) && this.doLevelUp) {
      this.currentUser!.progressKanji.quizLevel += 1;
    }

    this.userService.updateUserProgressKanji(this.currentUser!.uid, this.currentUser!.progressKanji);
  }

  testSession(id: number): void {
    this.quizStart = true;
    this.answered = false;
    this.result = '';
    this.icon = '';
    this.kanaService.getSingleKanjiById(id).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data()})
        )
      )
    ).subscribe(data => {
      this.kanjiArray = data;
    });
    console.log(this.numberAnswered);
    this.prepareAnswers(this.allKanjiList)
    console.log("nineAnswers from testSession", this.nineAnswers)
  }

  answering(answer: string, meaning: string[], sign: string, id: string) {
    this.answered = !this.answered;

    if (meaning.includes(answer.toLowerCase())) {
      this.result = "Poprawna odpowiedź";
      this.icon = "check_circle"
      this.numberAnswered = this.numberAnswered + 1;
      this.numberAnsweredCorrect = this.numberAnsweredCorrect + 1;

      if (typeof this.currentUser!.progressKanji[Number(id)] === 'undefined') {
        this.currentUser!.progressKanji[Number(id)] = {
          meaning: meaning,
          sign: sign,
          timesAnswered: 1,
          timesCorrect: [1]
        };
        console.log("new progress success")
      } else {
        this.currentUser!.progressKanji[Number(id)].timesAnswered += 1;

        if (this.currentUser!.progressKanji[Number(id)].timesCorrect.length >= 5) {
          this.currentUser!.progressKanji[Number(id)].timesCorrect.shift();
          this.currentUser!.progressKanji[Number(id)].timesCorrect.push(1);
        } else {
          this.currentUser!.progressKanji[Number(id)].timesCorrect.push(1);
        }
        console.log("old progress success")
      }

    } else {
      this.result = "Zła odpowiedź";
      this.icon = "cancel";
      this.numberAnswered = this.numberAnswered + 1;

      if (typeof this.currentUser!.progressKanji[Number(id)] === 'undefined') {
        this.currentUser!.progressKanji[Number(id)] = {
          meaning: meaning,
          sign: sign,
          timesAnswered: 1,
          timesCorrect: [0]
        };
        console.log("new progress fail")
      } else {
        this.currentUser!.progressKanji[Number(id)].timesAnswered += 1;

        if (this.currentUser!.progressKanji[Number(id)].timesCorrect.length >= 5) {
          this.currentUser!.progressKanji[Number(id)].timesCorrect.shift();
          this.currentUser!.progressKanji[Number(id)].timesCorrect.push(0);
        } else {
          this.currentUser!.progressKanji[Number(id)].timesCorrect.push(0);
        }
        console.log("old progress fail")
      }
    }

    if (this.numberAnswered >= this.idArray.length) {
      this.quizEnd = true;
      console.log(this.currentUser!.progressKanji);
      this.signProgressUp();
    }

    this.progressBar = (this.numberAnswered / this.idArray.length) * 100
  }

  score(correct: number, total: number): number {
    return correct / total;
  }

}
