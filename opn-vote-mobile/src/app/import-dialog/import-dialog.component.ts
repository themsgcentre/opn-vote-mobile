import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
})
export class ImportDialogComponent  implements OnInit {
  @Input() item: string | null = null;

  constructor() { }

  ngOnInit() {}

}
