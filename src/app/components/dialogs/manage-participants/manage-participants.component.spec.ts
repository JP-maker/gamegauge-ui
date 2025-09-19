import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageParticipantsComponent } from './manage-participants.component';

describe('ManageParticipantsComponent', () => {
  let component: ManageParticipantsComponent;
  let fixture: ComponentFixture<ManageParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
