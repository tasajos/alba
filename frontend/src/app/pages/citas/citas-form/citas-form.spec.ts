import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasForm } from './citas-form';

describe('CitasForm', () => {
  let component: CitasForm;
  let fixture: ComponentFixture<CitasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
