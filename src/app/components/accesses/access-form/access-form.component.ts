import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule} from '@angular/forms';
import {AccessService} from "../../../services/access.service";
import {AuthService} from "../../../services/auth.service";
import Swal from "sweetalert2";
import {LoginService} from "../../../services/login.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-access-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './access-form.component.html',
  styleUrl: './access-form.component.css'
})
export class AccessFormComponent implements OnInit{
  accessForm: FormGroup = {} as FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private  loginService : LoginService, private router : Router) {}

  ngOnInit(): void {
    this.accessForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      doc_number: [null, Validators.required],
      action: ['ENTRY', Validators.required], // Nueva acción (ENTRY/SALIDA)
      vehicle_type: ['CAR', Validators.required], // Tipo de vehículo (CAR/MOTORBIKE/etc.)
      vehicle_reg: ['', Validators.required], // Matrícula del vehículo
      vehicle_description: ['', Validators.required], // Descripción detallada del vehículo
      comments: [''] // Comentarios adicionales
    });
  }

  onSubmit() {
    if (this.accessForm.valid) {
      const formData = this.accessForm.value;

      this.authService.createAccess(formData, this.loginService.getLogin().id.toString()).subscribe(data => {
        Swal.fire('Registro exitoso...', "Se registró correctamente", 'success');
      });
    }
  }

  onCancel() {
    this.router.navigate(['/access/list']);
  }
}