// Fichier : src/app/pages/don/don.component.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * La page de soutien.
 *
 * Elle porte deux chemins vers le même lien PayPal, parce qu'un QR code seul
 * ne sert que la moitié des visiteurs : on ne scanne pas l'écran du téléphone
 * qu'on tient en main. Le bouton sert ceux qui sont déjà sur mobile, le code
 * sert ceux qui sont devant un ordinateur.
 */
@Component({
  selector: 'app-don',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './don.component.html',
  styleUrl: './don.component.scss'
})
export class DonComponent {
  /** Lien de don PayPal — celui qu'encode l'image du QR code. */
  readonly paypalUrl = 'https://www.paypal.com/qrcodes/managed/90b0e506-a0e3-486c-acd6-3dadee44918d';
}
