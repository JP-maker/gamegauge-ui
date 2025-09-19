import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScoreComponent } from './add-score.component';

describe('AddScoreComponent', () => {
  let component: AddScoreComponent;
  let fixture: ComponentFixture<AddScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
