// Відтінки: у товару додайте масив "shades" (від 2 відтінків). Кожен відтінок:
// { id, name, hex (колір кружечка), img (фото відтінку), inStock, undertones }.
// Товар p3 нижче має ТЕСТОВІ відтінки: замініть їх своїми. Без "shades" кружечків не буде.
window.FLORYS = {
  "tones": {
    "cool": "Холодний",
    "warm": "Теплий",
    "neutral": "Нейтральний",
    "olive": "Оливковий"
  },
  "cats": {
    "lips": "Губи",
    "eyes": "Очі",
    "face": "Обличчя",
    "accessories": "Аксесуари",
    "perfume": "Парфуми",
    "sets": "Набори"
  },
  "collections": [
    {
      "slug": "collection-1",
      "name": "Little Angel",
      "img": "assets/images/littleangel.webp"
    },
    {
      "slug": "collection-2",
      "name": "Bunny Garden",
      "img": "assets/images/bungard.webp"
    },
    {
      "slug": "new",
      "name": "Swan Ballet",
      "img": "assets/images/swan.webp"
    }
  ],
  "products": [
    {
      "id": "p1",
      "name": "Рум'яна The Sweetie Bear",
      "price": 820,
      "finish": "Матовий",
      "undertones": [],
      "img": "assets/images/bg.blsh.webp",
      "inStock": true,
      "category": "face",
      "collection": ""
    },
    {
      "id": "p2",
      "name": "Помада The Sweetie Bear",
      "price": 680,
      "finish": "Глянцевий",
      "undertones": [],
      "img": "assets/images/tsb.lg.webp",
      "inStock": true,
      "category": "lips",
      "collection": ""
    },
    {
      "id": "p3",
      "name": "Палетка тіней Swan Ballet",
      "price": 1150,
      "finish": "Матовий",
      "undertones": [],
      "img": "assets/images/sb.eye.webp",
      "inStock": true,
      "category": "eyes",
      "collection": "new",
      "shades": [
        {
          "id": "p3-1",
          "name": "Відтінок 1 White Swan",
          "hex": "#f9dbdb",
          "img": "assets/images/sb.eye.webp",
          "inStock": true,
          "undertones": []
        },
        {
          "id": "p3-2",
          "name": "Відтінок 2 Black Swan",
          "hex": "#000000",
          "img": "assets/images/la01.webp",
          "inStock": true,
          "undertones": []
        },
        {
          "id": "p3-3",
          "name": "Відтінок 3 Pink Swan",
          "hex": "#f9b7ef",
          "img": "assets/images/bg.blsh.webp",
          "inStock": true,
          "undertones": []
        }
      ]
    },
    {
      "id": "p4",
      "name": "Помада для губ Little Angel",
      "price": 710,
      "finish": "Матовий",
      "undertones": [],
      "img": "assets/images/la.lp.webp",
      "inStock": true,
      "category": "lips",
      "collection": "collection-1"
    },
    {
      "id": "p5",
      "name": "Палетка тіней Little Angel",
      "price": 1250,
      "finish": "Матовий",
      "undertones": [],
      "img": "assets/images/la01.webp",
      "inStock": false,
      "category": "eyes",
      "collection": "collection-1"
    },
    {
      "id": "p6",
      "name": "Кісточка для макіяжу",
      "price": 580,
      "finish": "",
      "undertones": [],
      "img": "assets/images/brush.webp",
      "inStock": true,
      "category": "accessories",
      "collection": ""
    }
  ]
};