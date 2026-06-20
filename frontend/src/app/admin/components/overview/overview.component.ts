import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class OverviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
