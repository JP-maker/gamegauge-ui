import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageParticipantsComponent } from './manage-participants.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ManageParticipantsComponent', () => {
  let component: ManageParticipantsComponent;
  let fixture: ComponentFixture<ManageParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { boardId: 1, participants: [] } },
      ],
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
