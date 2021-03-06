const fs = (<any>window).require("fs");

import { Component, OnInit } from "@angular/core";
import { PdfService } from "../shared/services/pdf.service";
import { WordService } from "../shared/services/word-service";

const timer = (f) => {
  const t = performance.now();
  f();
  return performance.now() - t;
};

const myid = "123445";
const vsinfo = `das ist ja mal eine Info\nund was für eine!`;
const kafkaText = `Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte,\n wurde er eines Morgens verhaftet.\n »Wie ein Hund!« sagte er, es war, als sollte die Scham ihn überleben.`;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private wordService: WordService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {}

  onMergePDF(): void {
    const pdfsToMerge = ["data/1.pdf", "data/2.pdf"];
    this.pdfService.mergePdfs(pdfsToMerge).then((pdfdata) => {
      fs.writeFileSync("data/merged.pdf", pdfdata);
    });
  }

  openTestDocument(): void {
    this.wordService.open("/tmp/1.docx");
    this.wordService.setActiveDocumentById(myid);
  }

  testEmpty(): void {
    const wordTrigger = `(doc, data) => {
      const t = data.helpers.toArray(doc.tables).find(t => t.title === "tabelle1");
      for ( let c = 1; c <= t.columns.count; c++ ){
        for ( let r = 1; r <= t.rows.count; r++ ){
          t.cell(r,c).range.text = "";
        }
      }
    }`;
    console.log(
      timer(() => {
        this.wordService.setActiveDocumentById(myid);
        this.wordService.runWordTrigger(wordTrigger, {});
        this.wordService.setTextfield("vsinfo", " ");
        for (let i = 1; i <= 15; i++)
          this.wordService.setTextfield(`cc${i}`, " ");
      })
    );
  }

  testFill(): void {
    console.log(
      timer(() => {
        this.wordService.setActiveDocumentById(myid);
        this.wordService.setTextfield("vsinfo", vsinfo);
        for (let i = 1; i <= 15; i++)
          this.wordService.setTextfield(`cc${i}`, kafkaText);
      })
    );
  }

  testFillEval(): void {
    const wordTrigger = `(doc, data) => {
      for (let i = 1; i <= 15; i++){
        const cc = doc.selectContentControlsByTag("cc" + i).item(1)
        cc.lockContents = false;
        cc.range.text = data.text;
        cc.lockContents = true;
      }
      const t = data.helpers.toArray(doc.tables).find(t => t.title === "tabelle1");
      for ( let c = 1; c <= t.columns.count; c++ ){
        for ( let r = 1; r <= t.rows.count; r++ ){
          t.cell(r,c).range.text = "Ich bin Zelle " + r + " " + c;
        }
      }
    }`;

    console.log(
      timer(() => {
        this.wordService.runWordTrigger(wordTrigger, {
          text: kafkaText,
        });
      })
    );
  }

  saveAsPDF(): void {
    this.wordService.saveAsPdf("/tmp/test.pdf");
  }

  close(): void {
    this.wordService.close();
  }

  quit(): void {
    this.wordService.quit();
  }
}
