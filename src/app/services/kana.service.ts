import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { Kana } from "../models/kana.model";
import firebase from "firebase/compat/app";
import firestore = firebase.firestore;

@Injectable({
  providedIn: 'root'
})
export class KanaService {
  private katakanaDbPath = '/katakana';
  private hiraganaDbPath = '/hiragana';

  katakanaRef: AngularFirestoreCollection<Kana>;
  hiraganaLevelOne: AngularFirestoreCollection<Kana>;
  hiraganaLevelTwo: AngularFirestoreCollection<Kana>;
  katakanaLevelOne: AngularFirestoreCollection<Kana>;
  katakanaLevelTwo: AngularFirestoreCollection<Kana>;
  hiraganaRef: AngularFirestoreCollection<Kana>;
  singleKanaRef: AngularFirestoreCollection<Kana>;
  firstNineKana: AngularFirestoreCollection<Kana>;

  constructor(private db: AngularFirestore) {

    this.katakanaRef = db.collection(this.katakanaDbPath);
    this.hiraganaRef = db.collection(this.hiraganaDbPath);
    this.singleKanaRef = db.collection(this.hiraganaDbPath,
        ref => ref.where(firestore.FieldPath.documentId(), '==', 'uERNQsV8GNkmjIhXhd2X'));
    this.hiraganaLevelOne = db.collection(this.hiraganaDbPath,
      ref => ref.where('level', '==',1))
    this.hiraganaLevelTwo = db.collection(this.hiraganaDbPath,
      ref => ref.where('level', '==',2))
    this.katakanaLevelOne = db.collection(this.katakanaDbPath,
        ref => ref.where('level', '==',1))
    this.katakanaLevelTwo = db.collection(this.katakanaDbPath,
      ref => ref.where('level', '==',2))
    this.firstNineKana = db.collection(this.hiraganaDbPath, ref => ref.where('id', '>=',1).orderBy('id').limit(1))
  }


  getAllKatakana(): AngularFirestoreCollection<Kana> {
    return this.katakanaLevelOne;
  }

  getFirstNine():AngularFirestoreCollection<Kana>{
    let x: number
    x = Math.floor(Math.random() * (107 - 1 + 1)) + 1;
    this.firstNineKana = this.db.collection(this.hiraganaDbPath, ref => ref.where('id', '>=',x).orderBy('id').limit(1))
    return this.firstNineKana
  }

  getOneRandom(id: number):AngularFirestoreCollection<Kana>{

    let random = Math.floor(Math.random() * (107 - 1 + 1)) + 1;

    return this.getAllHiragana()
  }

  getSpecificLevel(level: number, type: string): AngularFirestoreCollection<Kana>{
    if (type == 'katakana') {
      if (level == 1)
        return this.katakanaLevelOne;
      else (level == 2)
        return this.katakanaLevelTwo;
    }
    else (type == 'hiragana')
      if (level == 1)
        return this.hiraganaLevelOne;
      else (level == 2)
        return this.hiraganaLevelTwo;
  }

  createKatakana(katakana: Kana): any {
    return this.katakanaRef.add({ ...katakana})
  }

  updateKatakana(id: string, data: any): Promise<void> {
    return this.katakanaRef.doc(id).update(data);
  }

  deleteKatakana(id: string): Promise<void> {
    return this.katakanaRef.doc(id).delete();
  }

  getAllHiragana(): AngularFirestoreCollection<Kana> {
    return this.hiraganaRef;
  }

  createHiragana(hiragana: Kana): any {
    return this.hiraganaRef.add({ ...hiragana})
  }

  updateHiragana(id: string, data: any): Promise<void> {
    return this.hiraganaRef.doc(id).update(data);
  }

  deleteHiragana(id: string): Promise<void> {
    return this.hiraganaRef.doc(id).delete();
  }

  getOneKana(): AngularFirestoreCollection<Kana> {
    return this.singleKanaRef;
  }

}
