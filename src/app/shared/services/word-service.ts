import { Injectable } from "@angular/core";
import wordConsts from "./word-consts";
import winax from "winax";

interface wdoc {
  count: number;
  item: (arg0: number) => any;
  save: () => void;
  saveAs: (string, number) => void;
  close: () => void;
  selectContentControlsByTag: (string) => any;
}

interface wlist {
  count: number;
  item: (arg0: number) => any;
}

const toArray = (l: wlist): Array<any> => {
  let res = [];
  for (let i = 1; i <= l.count; i++) res = [...res, l.item(i)];
  return res;
};

@Injectable({ providedIn: "root" })
export class WordService {
  private app = undefined;
  private doc = undefined;

  constructor() {}

  private checkApp(): void {
    if (!this.app || !this.app.documents)
      this.app = new winax.Object("Word.Application");
  }

  open(filename: string): void {
    this.checkApp();
    this.app.visible = true;
    this.doc = this.app.documents.open(filename);
  }

  setVariable(name: string, val: string): void {
    this.doc.variables.add(name, val);
  }

  setId(id: string): void {
    this.setVariable("id", id);
  }

  setActiveDocumentById(id: string):void {
    toArray(this.app.documents).forEach((d) => {
      const varId = d.variables.item("id");
      if (varId && varId.value === id) {
        this.doc = d;
      }
    });
  }

  close(): void {
    this.doc.activeDocument.close();
  }

  quit(): void {
    if (this.app) {
      toArray(this.app.documents).forEach((doc) => {
        doc.close(false);
      });
      this.app.quit();
      this.app = undefined;
    }
  }

  saveAsPdf(path: string): void {
    this.doc.saveAs(path, wordConsts.WdExportFormat.wdExportFormatPDF);
  }

  setVisible(): void {
    this.app.visible = true;
  }

  setInvisible(): void {
    this.app.visible = false;
  }

  setTextfield(ccname: string, value: string): void {
    toArray(this.doc.selectContentControlsByTag(ccname)).forEach((cc) => {
      const range = cc.range;
      if (range.text !== value) {
        cc.lockContents = false;
        range.text = value;
        cc.lockContents = true;
      }
    });
  }
}
