import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
export default class Grille {
  /**
   * Constructeur de la grille
   * @param {number} l nombre de lignes
   * @param {number} c nombre de colonnes
   */
  constructor(l, c) {
    this.colonnes = c;
    this.lignes = l;

    this.cookiesCliquees = [];
    this.tabcookies = this.remplirTableauDeCookies(6);
    this.cookieSelectionne = null;

    /*
    let existeAlignement = false;
    do {
      this.remplirTableauDeCookies(6);
      existeAlignement = this.testAlignementTouteLaGrille();
      console.log("ExisteAlignement : " + existeAlignement)
    } while(existeAlignement)
    */
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index / this.lignes);
      let colonne = index % this.colonnes;
      console.log("On remplit le div index=" + index + " l=" + ligne + " col=" + colonne);

      // on récupère le cookie correspondant à cette case
      let cookie = this.tabcookies[ligne][colonne];
      // on récupère l'image correspondante
      let img = cookie.htmlImage;

      img.onclick = (event) => {
        let imgClickee = event.target;
        let cookie = this.getCookieFromImage(imgClickee);
        console.log(cookie);
        console.log("On a cliqué sur la ligne " + ligne + " et la colonne " + colonne);
        //let cookieCliquee = this.getCookieFromLC(ligne, colonne);
        console.log("Le cookie cliqué est de type " + cookie.type);

        if (!this.cookiesCliquees.includes(cookie)) {
          this.cookiesCliquees.push(cookie);
          cookie.selectionnee();
        }
        if (this.cookiesCliquees.length === 2) {
          let cookie1 = this.cookiesCliquees[0];
          let cookie2 = this.cookiesCliquees[1];

          this.essayerDeSwapper(cookie1, cookie2);
        }

        // A FAIRE : tester combien de cookies sont sélectionnées
        // si 0 on ajoute le cookie cliqué au tableau
        // si 1 on ajoute le cookie cliqué au tableau
        // et on essaie de swapper
      }

      // A FAIRE : ecouteur de drag'n'drop
      // Avec drag'n'drop, on draggue une image qu'on lâche dans une case. En fait
      // on lache sur une autre image (puisque les images occupent toute la place du div)
      // On mettra donc les écouteurs de "drop" aussi sur les images
      img.ondragstart = (evt) => {
            console.log("drag start");
            let imgClickee = evt.target;
            let cookie = this.getCookieFromImage(imgClickee);
            evt.dataTransfer.setData("pos", JSON.stringify(imgClickee.dataset));
      }

      img.ondragover = (evt) => {
        evt.preventDefault();
      }

      img.ondragenter = (evt) => {
        evt.target.classList.add("grilleDragOver");
      }

      img.ondragleave = (evt) => {
        evt.target.classList.remove("grilleDragOver");
      }

      img.ondrop = (evt) => {
        evt.target.classList.remove("grilleDragOver");

        let position = JSON.parse(evt.dataTransfer.getData("pos"));
        let cookie1 = this.getCookieFromLigneColonne(position.ligne, position.colonne);

        let imgClickee = evt.target;
        let cookie2 = this.getCookieFromImage(imgClickee);

        this.essayerDeSwapper(cookie1, cookie2);
      }

      // on affiche l'image dans le div pour la faire apparaitre à l'écran.
      div.appendChild(img);
    });
  }

  essayerDeSwapper(cookie1, cookie2) {
    if (this.swap(cookie1, cookie2)) {
      console.log("On peut swapper");
      // on remet à zéro les cookies cliquées
      cookie2.deselectionnee();
      this.cookiesCliquees = [];
    }else {
      console.log("On ne peut pas swapper");
      cookie2.deselectionnee();
      this.cookiesCliquees.splice(1, 1);
    }
  }
  swap(cookie1, cookie2) {
    if (!Cookie.swapDistancePossible(cookie1, cookie2)) return false;
    Cookie.swapCookies(cookie1, cookie2);
    return true;
  }

  getCookieFromImage(img) {
    let ligneCookie = img.dataset.ligne;
    let colonneCookie = img.dataset.colonne;
    return this.tabcookies[ligneCookie][colonneCookie];
  }

  getCookieFromLigneColonne(l, c) {
    return this.tabcookies[l][c];
  }

  // inutile ?
  getCookieFromLC(ligne, colonne) {
    return this.tabcookies[ligne][colonne];
  }

  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */
  remplirTableauDeCookies(nbDeCookiesDifferents) {
    // créer un tableau vide de 9 cases pour une ligne
    // en JavaScript on ne sait pas créer de matrices
    // d'un coup. Pas de new tab[3][4] par exemple.
    // Il faut créer un tableau vide et ensuite remplir
    // chaque case avec un autre tableau vide
    // Faites ctrl-click sur la fonction create2DArray
    // pour voir comment elle fonctionne
    let tab = create2DArray(9);

    // remplir
    for(let l = 0; l < this.lignes; l++) {
      for(let c =0; c < this.colonnes; c++) {

        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random()*nbDeCookiesDifferents);
        //console.log(type)
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
  }

  testAlignementTouteLaGrille() {
    let alignementExisteLigne = false;
    let alignementExisteColonne = false;

    alignementExisteColonne = this.testAlignementToutesLesColonnes();
    alignementExisteLigne = this.testAlignementToutesLesLignes();
    return (alignementExisteLigne || alignementExisteColonne);
  }
  testAlignementToutesLesColonnes() {
    let alignementColonnes = false;
    for (let i = 0; i < this.colonnes; i++) {
      alignementColonnes = this.testAlignementColonnes(i);
    }
    return alignementColonnes;
  }
  testAlignementColonnes(colonne) {
    let alignement = false;

    for (let l = 0; l <= this.colonnes - 3; l++) {
      let cookie1 = this.tabcookies[l][colonne];
      let cookie2 = this.tabcookies[l + 1][colonne];
      let cookie3 = this.tabcookies[l + 2][colonne];

      if ((cookie1.type === cookie2.type) && (cookie2.type === cookie3.type)) {
        cookie1.cachee();
        cookie2.cachee();
        cookie3.cachee();
        alignement = true;
      }
    }
    return alignement;
  }

  testAlignementToutesLesLignes() {
    let alignementLignes = false;
    for (let i = 0; i < this.lignes; i++) {
      alignementLignes = this.testAlignementLignes(i);
    }

    return alignementLignes;
  }
  testAlignementLignes(ligne) {
    let alignement = false;

    let tabLigne = this.tabcookies[ligne];

    for (let c = 0; c <= this.lignes - 3; c++) {
        let cookie1 = tabLigne[c];
        let cookie2 = tabLigne[c + 1];
        let cookie3 = tabLigne[c + 2];

      if ((cookie1.type === cookie2.type) && (cookie2.type === cookie3.type)) {
        cookie1.cachee();
        cookie2.cachee();
        cookie3.cachee();
        alignement = true;
      }
    }
    return alignement;
  }

  /*
  chuteColonne(colonne) {
    let indexPremierCookieCache = -1;
    let indexDernierCookieCache = -1;

    for (let ligne = this.lignes - 1; ligne >= 0; ligne--) {
      if (this.tabcookies[ligne][colonne].htmlImage.classList.contains("cookie-cachee")) {
        indexPremierCookieCache = ligne;
        break;
      }
    }
    if (indexPremierCookieCache !== -1) {
      for (let ligne = indexPremierCookieCache; ligne >= 0; ligne--) {
        if (!this.tabcookies[ligne][colonne].htmlImage.classList.contains("cookie-cachee")) {
          indexDernierCookieCache = ligne+1;
          break;
        }
      }
      if (indexDernierCookieCache === -1) {
        indexDernierCookieCache = 0;
      }
    }
    console.log("indexPremierCookieCache = " + indexPremierCookieCache);
    console.log("indexDernierCookieCache = " + indexDernierCookieCache);
    if (indexPremierCookieCache !== -1 && indexDernierCookieCache !== -1) {
      this.compacteColonne(indexPremierCookieCache, indexDernierCookieCache, colonne);
    }
  }
   */

  chuteColonne(colonne) {
    let indexPremierTrou = -1;
    let indexFin = -1;

    // Trouver le premier trou
    for (let ligne = this.lignes - 1; ligne > 0; ligne--) {
      if (this.tabcookies[ligne][colonne].htmlImage.classList.contains("cookie-cachee")) {
        indexPremierTrou = ligne;
        break;
      }
    }

    // Si aucun trou n'est trouvé, terminer la fonction
    if (indexPremierTrou === -1) {
      return;
    }

    // Trouver le haut de la colonne ou un cookie
    for (let ligne = indexPremierTrou; ligne > 0; ligne--) {
      if (!this.tabcookies[ligne][colonne].htmlImage.classList.contains("cookie-cachee")) {
        indexFin = ligne;
        break;
      }
    }

    // Si on n'a pas trouvé de cookie, indexFin reste à -1, ce qui indique le haut de la colonne

    // Appeler compacteColonne pour déplacer les cookies vers le bas
    this.compacteColonne(indexPremierTrou, indexFin, colonne);
  }

  compacteColonne(indexDebut, indexFin, colonne) {
    let ligneSource = indexFin === -1 ? 0 : indexFin + 1;

    for (let ligne = indexDebut; ligne > 0; ligne--) {
      this.tabcookies[ligne][colonne].type = this.tabcookies[ligne - ligneSource][colonne].type;
      let img = this.tabcookies[ligne][colonne].htmlImage;
      img.src = Cookie.urlsImagesNormales[this.tabcookies[ligne][colonne].type];
    }

    // Les cases restantes en haut de la colonne sont laissées vides pour l'instant
  }

  descendrePremiereColonne() {
    for (let ligne = 8; ligne > 0; ligne--) {
      this.tabcookies[ligne][0].type = this.tabcookies[ligne - 1][0].type
      let img = this.tabcookies[ligne][0].htmlImage;
      img.src = Cookie.urlsImagesNormales[this.tabcookies[ligne][0].type];
    }
    this.tabcookies[0][0].type = Math.floor(Math.random()*6);
    let img = this.tabcookies[0][0].htmlImage;
    img.src = Cookie.urlsImagesNormales[this.tabcookies[0][0].type];
  }

}
