import {Component, OnInit} from '@angular/core';
import {KanaService} from "../../services/kana.service";
import {map} from "rxjs/operators";
import {Kana} from "../../models/kana.model";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-hiragana-list',
  templateUrl: './hiragana-list.component.html',
  styleUrls: ['./hiragana-list.component.css']
})
export class HiraganaListComponent implements OnInit {

  hiragana?: Kana[];
  currentHiragana?: Kana;
  currentIndex = -1;
  title = '';
  result = '';
  routeParam: number = 0;
  randomNumber = 0;
  numberAnswered = 0;
  arrayEnd = 0;
  numberOfCorrect = 0;
  orderArray = [];
  answered = false;

  constructor(private route: ActivatedRoute, private kanaService: KanaService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.routeParam = params['level'];
    });
    console.log(this.routeParam)
    this.generateArray(this.routeParam)
  }

  generateArray(level: number) {
    if (level == 1) {
      while (this.orderArray.length < 46) {
        this.randomNumber = Math.floor(Math.random() * 46) + 1;
        // @ts-ignore
        if (this.orderArray.indexOf(this.randomNumber) === -1) this.orderArray.push(this.randomNumber);
      }
      this.arrayEnd = 46;
      console.log(this.orderArray);
    } else {
      while (this.orderArray.length < 61) {
        this.randomNumber = Math.floor(Math.random() * (108 - 47) + 47);
        // @ts-ignore
        if (this.orderArray.indexOf(this.randomNumber) === -1) this.orderArray.push(this.randomNumber);
      }
      this.arrayEnd = 107;
      console.log(this.orderArray);
    }
  }

  // refreshList(): void {
  //   this.currentHiragana = undefined;
  //   this.currentIndex = -1;
  //   this.retrieveHiragana();
  // }

  retrieveOneRandomHiragana(): void {
    this.answered = false;
    this.result = '';
    this.kanaService.getSingleRandomHiragana().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.hiragana = data;
    });
  }

  score(correct: number, total: number): number{
    return correct / total
  }

  testSession(id: number): void {
    this.answered = false;
    this.result = '';
    this.kanaService.getSingleHiraganaById(id).snapshotChanges().pipe(
      map(changes =>
          changes.map(c =>
            ({id: c.payload.doc.id, ...c.payload.doc.data()})
          )
        )
      ).subscribe(data => {
        this.hiragana = data;
      });
    console.log(this.numberAnswered);
  }

  retrieveOneRandomHiraganaByLevel(level: number): void {
    this.answered = false;
    this.result = '';
    this.kanaService.getSingleRandomHiraganaByLevel(level).snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.hiragana = data;
    });
  }

  retrieveAllHiraganaByLevel(level: number): void {
    this.kanaService.getSpecificLevel(level, 'hiragana').snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.hiragana = data;
    });
  }

  setActiveHiragana(hiragana: Kana, index: number): void {
    this.currentHiragana = hiragana;
    this.currentIndex = index;
  }

  retrieveSingleHiragana(): any {
    this.kanaService.getOneKana().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.hiragana = data;
    });
  }

  answering(answer: string, reading?: string) {
    this.answered = !this.answered;

    if (reading == answer) {
      this.result = "Poprawna odpowiedź";
      this.numberAnswered = this.numberAnswered +1
      this.numberOfCorrect = this.numberOfCorrect +1
    }
    else {
      this.result = "Zła odpowiedź";
      this.numberAnswered = this.numberAnswered +1
    }
  }
}
