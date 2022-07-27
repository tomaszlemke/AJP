import { Component, OnInit } from '@angular/core';
import {Kanji} from "../../models/kanji.model";
import {ActivatedRoute} from "@angular/router";
import {KanaService} from "../../services/kana.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {UserService} from "../../services/user.service";
import {map} from "rxjs/operators";
import {UserModel} from "../../models/user.model";
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
  result = '';
  routeParam: number = 0;
  numberAnswered = 0;
  numberAnsweredCorrect = 0;
  idArray: number[] = [];
  answered = false;
  quizEnd = false;
  xxx: Kanji[] = [];
  centered = false;
  disabled = false;
  unbounded = false;

  radius: number = 0;
  color: string = '';


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
    this.generateArray(this.routeParam)
    this.getAllKanji()
  }

  getAllKanji(): void {
    this.kanaService.getAllKanji().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data()})
        )
      )
    ).subscribe(data => {
      // @ts-ignore
      this.xxx = data;
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

  prepareAnswers(id: Kanji[]) {
    var set = new Set();

    while (set.size < 9) {
      set.add(Math.floor(Math.random() * (this.idArray.length - 1 + 1)) + 1)
    }

    console.log(set)
    var tessss = Array.from(set)

    this.nineAnswers = Array.from({length: 9}, (_, i) =>
      // @ts-ignore
      id[tessss[i]]);
    console.log(tessss)
  }

  //The Fisher-Yates algorithm
  shuffleArray(array: Array<number>): Array<number> {
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
    this.userService.updateUserProgressKanji(this.currentUser!.uid, this.currentUser!.progressKanji);
  }

  testSession(id: number): void {
    this.answered = false;
    this.quizEnd = false;
    this.result = '';
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
    this.prepareAnswers(this.xxx)
    console.log(this.nineAnswers)
  }

  answering(answer: string, meaning: string[], sign: string, id: string) {
    this.answered = !this.answered;

    if (meaning.includes(answer.toLowerCase())) {
      this.result = "Poprawna odpowiedź";
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
  }

  score(correct: number, total: number): number {
    return correct / total;
  }
}
