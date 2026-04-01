interface Macro {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Ingredient {
    name: string;
    grams?: number;
}

export interface Recipe {
    title: string;
    ingredients: Ingredient[];
    time: string;
    calories: string;
    price: string;
    img: string;
    macros?: Macro;
    steps?: string[];
}



export const recipes: Recipe[] = [
    {
        title: "High-Protein Chicken Burrito Bowl",
        ingredients: [
            { name: "Chicken breast", grams: 150 },
            { name: "Brown rice", grams: 120 },
            { name: "Black beans", grams: 130 },
            { name: "Corn", grams: 80 },
            { name: "Avocado", grams: 70 },
            { name: "Lettuce", grams: 50 },
            { name: "Salsa", grams: 40 },
            { name: "Olive oil", grams: 5 },
        ],
        time: "25 minutes",
        calories: "575 kcal",
        price: "$9.49",
        img: "/RecipeImages/ChickenBurrito.JPG",
        macros: { kcal: 575, protein: 46, carbs: 58, fat: 18 },
        steps: [
            "Cook brown rice according to package instructions",
            "Season and grill chicken breast until fully cooked",
            "Warm black beans and corn in a pan",
            "Slice avocado and prepare fresh lettuce",
            "Assemble bowl with rice as base, top with chicken, beans, corn",
            "Add avocado, lettuce, salsa and drizzle with olive oil"
        ],
    },
    {
        title: "Chocolate Protein Overnight Oats",
        ingredients: [
            { name: "Oats", grams: 50 },
            { name: "Whey protein", grams: 30 },
            { name: "Chia seeds", grams: 10 },
            { name: "Greek yogurt", grams: 100 },
            { name: "Almond milk", grams: 120 },
            { name: "Honey", grams: 5 },
        ],
        time: "8 hours (overnight)",
        calories: "425 kcal",
        price: "$4.99",
        img: "/RecipeImages/ChocolateShake.JPG",
        macros: { kcal: 425, protein: 37, carbs: 48, fat: 9 },
        steps: [
            "Mix oats, whey protein, and chia seeds in a container",
            "Add Greek yogurt and almond milk",
            "Stir well until everything is combined",
            "Drizzle honey on top",
            "Cover and refrigerate overnight (8 hours)",
            "Enjoy cold in the morning"
        ],
    },
    {
        title: "Lean Beef Veggie Skillet",
        ingredients: [
            { name: "Lean beef", grams: 150 },
            { name: "Bell peppers", grams: 80 },
            { name: "Zucchini", grams: 80 },
            { name: "Mushrooms", grams: 80 },
            { name: "Spinach", grams: 50 },
            { name: "Soy sauce", grams: 10 },
        ],
        time: "20 minutes",
        calories: "300 kcal",
        price: "$8.99",
        img: "/RecipeImages/BeefVeggie.JPG",
        macros: { kcal: 300, protein: 33, carbs: 10, fat: 12 },
        steps: [
            "Heat skillet over medium-high heat",
            "Add lean beef and cook until browned",
            "Add bell peppers, zucchini, and mushrooms",
            "Stir-fry vegetables until tender-crisp",
            "Add spinach and soy sauce",
            "Cook for 2 more minutes and serve hot"
        ],
    },
    {
        title: "High-Protein Greek Yogurt Parfait",
        ingredients: [
            { name: "Greek yogurt", grams: 200 },
            { name: "Whey protein", grams: 15 },
            { name: "Banana", grams: 50 },
            { name: "Berries", grams: 50 },
            { name: "Almond butter", grams: 15 },
        ],
        time: "5 minutes",
        calories: "385 kcal",
        price: "$5.49",
        img: "/RecipeImages/HighProteinGreek.JPG",
        macros: { kcal: 385, protein: 35, carbs: 38, fat: 12 },
        steps: [
            "Mix Greek yogurt with whey protein until smooth",
            "Slice banana into thin rounds",
            "Layer yogurt mixture in a glass or bowl",
            "Add banana slices and berries",
            "Drizzle almond butter on top",
            "Serve immediately and enjoy"
        ],
    },
    {
        title: "Tuna Pasta Salad",
        ingredients: [
            { name: "Tuna", grams: 160 },
            { name: "Whole-wheat pasta", grams: 120 },
            { name: "Sweetcorn", grams: 70 },
            { name: "Cherry tomatoes", grams: 80 },
            { name: "Greek yogurt", grams: 40 },
            { name: "Olive oil", grams: 5 },
        ],
        time: "15 minutes",
        calories: "345 kcal",
        price: "$7.99",
        img: "/RecipeImages/TunaPasta.JPG",
        macros: { kcal: 345, protein: 33, carbs: 39, fat: 8 },
        steps: [
            "Cook whole-wheat pasta according to package directions",
            "Drain tuna and flake it with a fork",
            "Mix Greek yogurt with olive oil",
            "Combine pasta, tuna, sweetcorn, and cherry tomatoes",
            "Toss with yogurt dressing",
            "Chill for 10 minutes or serve immediately"
        ],
    },
    {
        title: "Chicken Protein Wrap",
        ingredients: [
            { name: "Chicken", grams: 120 },
            { name: "Tortilla", grams: 60 },
            { name: "Spinach", grams: 30 },
            { name: "Hummus", grams: 30 },
            { name: "Low-fat cheese", grams: 20 },
        ],
        time: "10 minutes",
        calories: "420 kcal",
        price: "$6.99",
        img: "/RecipeImages/ChickenProteinWrap.JPG",
        macros: { kcal: 420, protein: 44, carbs: 36, fat: 12 },
        steps: [
            "Cook and slice chicken breast",
            "Warm tortilla in a pan or microwave",
            "Spread hummus on the tortilla",
            "Layer spinach leaves on top",
            "Add sliced chicken and low-fat cheese",
            "Roll tightly and cut in half to serve"
        ],
    },
    {
        title: "Egg Protein Muffins (per muffin)",
        ingredients: [
            { name: "Eggs", grams: 300 },
            { name: "Egg whites", grams: 100 },
            { name: "Spinach", grams: 40 },
            { name: "Bell pepper", grams: 50 },
            { name: "Low-fat cheese", grams: 40 },
        ],
        time: "25 minutes",
        calories: "90 kcal",
        price: "$0.99",
        img: "/RecipeImages/EggProteinMuffins.JPG",
        macros: { kcal: 90, protein: 10, carbs: 2, fat: 4 },
        steps: [
            "Preheat oven to 350°F (175°C)",
            "Whisk eggs and egg whites together",
            "Add chopped spinach, bell pepper, and cheese",
            "Pour mixture into greased muffin tin",
            "Bake for 20-25 minutes until set",
            "Cool slightly and remove from tin"
        ],
    },
    {
        title: "Berry Protein Smoothie",
        ingredients: [
            { name: "Whey protein", grams: 30 },
            { name: "Berries", grams: 120 },
            { name: "Banana", grams: 60 },
            { name: "Greek yogurt", grams: 100 },
            { name: "Almond milk", grams: 150 },
        ],
        time: "5 minutes",
        calories: "360 kcal",
        price: "$4.49",
        img: "/RecipeImages/BerryProteinSmoothie.JPG",
        macros: { kcal: 360, protein: 33, carbs: 46, fat: 4 },
        steps: [
            "Add whey protein to blender",
            "Add berries and sliced banana",
            "Add Greek yogurt and almond milk",
            "Blend on high until smooth and creamy",
            "Add ice cubes if desired for thickness",
            "Pour into glass and enjoy immediately"
        ],
    },
    {
        title: "Turkey Protein Meatballs",
        ingredients: [
            { name: "Turkey", grams: 125 },
            { name: "Oat flour", grams: 15 },
            { name: "Egg", grams: 25 },
            { name: "Tomato sauce", grams: 40 },
        ],
        time: "30 minutes",
        calories: "300 kcal",
        price: "$8.49",
        img: "/RecipeImages/TurkeyProteinMeatballs.JPG",
        macros: { kcal: 300, protein: 38, carbs: 10, fat: 10 },
        steps: [
            "Preheat oven to 375°F (190°C)",
            "Mix ground turkey with oat flour and egg",
            "Season mixture and form into meatballs",
            "Place on lined baking sheet",
            "Bake for 20-25 minutes until cooked through",
            "Serve with warm tomato sauce"
        ],
    },
    {
        title: "Chickpea Power Bowl",
        ingredients: [
            { name: "Chickpeas", grams: 200 },
            { name: "Spinach", grams: 40 },
            { name: "Quinoa", grams: 150 },
            { name: "Avocado", grams: 70 },
            { name: "Olive oil", grams: 10 },
        ],
        time: "30 minutes",
        calories: "585 kcal",
        price: "$9.49",
        img: "/RecipeImages/ChickpeaPowerBowl.png",
        macros: { kcal: 585, protein: 24, carbs: 66, fat: 22 },
        steps: [
            "Cook quinoa according to package instructions",
            "Drain and rinse chickpeas",
            "Sauté spinach until wilted",
            "Slice avocado",
            "Assemble bowl with quinoa as base",
            "Top with chickpeas, spinach, avocado and drizzle olive oil"
        ],
    },

    {
        title: "Salmon Teriyaki with Broccoli",
        ingredients: [
            { name: "Salmon fillet", grams: 180 },
            { name: "Broccoli", grams: 150 },
            { name: "Brown rice", grams: 100 },
            { name: "Teriyaki sauce", grams: 30 },
            { name: "Sesame seeds", grams: 5 },
            { name: "Olive oil", grams: 5 },
        ],
        time: "20 minutes",
        calories: "520 kcal",
        price: "$12.99",
        img: "/RecipeImages/SalmonTeriyaki.png",
        macros: { kcal: 520, protein: 42, carbs: 45, fat: 18 },
        steps: [
            "Cook brown rice according to package directions",
            "Steam or roast broccoli until tender",
            "Heat olive oil in a pan over medium heat",
            "Cook salmon fillet for 4-5 minutes per side",
            "Brush teriyaki sauce on salmon during last 2 minutes",
            "Sprinkle sesame seeds and serve with rice and broccoli"
        ],
    },
    {
        title: "Protein Pancakes",
        ingredients: [
            { name: "Whey protein", grams: 30 },
            { name: "Oat flour", grams: 40 },
            { name: "Eggs", grams: 100 },
            { name: "Banana", grams: 60 },
            { name: "Blueberries", grams: 50 },
            { name: "Greek yogurt", grams: 50 },
        ],
        time: "15 minutes",
        calories: "380 kcal",
        price: "$5.99",
        img: "/RecipeImages/ProteinPancakes.png",
        macros: { kcal: 380, protein: 35, carbs: 42, fat: 8 },
        steps: [
            "Mash banana in a bowl",
            "Add eggs, whey protein, and oat flour",
            "Mix until smooth batter forms",
            "Heat non-stick pan over medium heat",
            "Pour batter to form pancakes and cook 2-3 minutes per side",
            "Serve with blueberries and Greek yogurt"
        ],
    },
    {
        title: "Spicy Shrimp Stir-Fry",
        ingredients: [
            { name: "Shrimp", grams: 200 },
            { name: "Bell peppers", grams: 100 },
            { name: "Snap peas", grams: 80 },
            { name: "Carrots", grams: 60 },
            { name: "Soy sauce", grams: 15 },
            { name: "Chili flakes", grams: 2 },
            { name: "Olive oil", grams: 10 },
        ],
        time: "18 minutes",
        calories: "280 kcal",
        price: "$11.49",
        img: "/RecipeImages/ShrimpStirFry.png",
        macros: { kcal: 280, protein: 38, carbs: 18, fat: 8 },
        steps: [
            "Heat olive oil in a wok or large pan",
            "Add shrimp and cook for 2 minutes until pink",
            "Remove shrimp and set aside",
            "Stir-fry bell peppers, snap peas, and carrots for 3-4 minutes",
            "Return shrimp to pan, add soy sauce and chili flakes",
            "Toss everything together and serve hot"
        ],
    },
    {
        title: "Cottage Cheese Protein Bowl",
        ingredients: [
            { name: "Cottage cheese", grams: 200 },
            { name: "Cherry tomatoes", grams: 80 },
            { name: "Cucumber", grams: 80 },
            { name: "Avocado", grams: 50 },
            { name: "Pumpkin seeds", grams: 15 },
            { name: "Olive oil", grams: 5 },
        ],
        time: "8 minutes",
        calories: "340 kcal",
        price: "$6.49",
        img: "/RecipeImages/CottageCheeseBowl.png",
        macros: { kcal: 340, protein: 28, carbs: 15, fat: 18 },
        steps: [
            "Place cottage cheese in a bowl",
            "Halve cherry tomatoes",
            "Dice cucumber",
            "Slice avocado",
            "Arrange vegetables around cottage cheese",
            "Sprinkle pumpkin seeds and drizzle with olive oil"
        ],
    },
    {
        title: "Beef and Sweet Potato Hash",
        ingredients: [
            { name: "Lean ground beef", grams: 150 },
            { name: "Sweet potato", grams: 200 },
            { name: "Onion", grams: 60 },
            { name: "Bell pepper", grams: 70 },
            { name: "Spinach", grams: 40 },
            { name: "Olive oil", grams: 10 },
        ],
        time: "25 minutes",
        calories: "450 kcal",
        price: "$9.99",
        img: "/RecipeImages/BeefSweetPotatoHash.png",
        macros: { kcal: 450, protein: 35, carbs: 48, fat: 12 },
        steps: [
            "Dice sweet potato into small cubes",
            "Heat olive oil in large skillet",
            "Cook sweet potato until tender, about 10 minutes",
            "Add ground beef and cook until browned",
            "Add diced onion and bell pepper, cook 5 minutes",
            "Stir in spinach until wilted and serve"
        ],
    },
    {
        title: "Peanut Butter Protein Bites",
        ingredients: [
            { name: "Oats", grams: 60 },
            { name: "Whey protein", grams: 25 },
            { name: "Peanut butter", grams: 40 },
            { name: "Honey", grams: 20 },
            { name: "Dark chocolate chips", grams: 15 },
        ],
        time: "10 minutes (+ chill time)",
        calories: "320 kcal",
        price: "$4.99",
        img: "/RecipeImages/PeanutButterBites.png",
        macros: { kcal: 320, protein: 22, carbs: 35, fat: 12 },
        steps: [
            "Mix oats, whey protein in a bowl",
            "Add peanut butter and honey",
            "Stir until mixture is combined and sticky",
            "Fold in dark chocolate chips",
            "Roll into bite-sized balls",
            "Refrigerate for at least 30 minutes before serving"
        ],
    },
    {
        title: "Mediterranean Chicken Salad",
        ingredients: [
            { name: "Grilled chicken", grams: 150 },
            { name: "Mixed greens", grams: 80 },
            { name: "Feta cheese", grams: 30 },
            { name: "Olives", grams: 20 },
            { name: "Cucumber", grams: 70 },
            { name: "Cherry tomatoes", grams: 60 },
            { name: "Olive oil", grams: 10 },
        ],
        time: "15 minutes",
        calories: "390 kcal",
        price: "$8.99",
        img: "/RecipeImages/MediterraneanChickenSalad.png",
        macros: { kcal: 390, protein: 40, carbs: 12, fat: 20 },
        steps: [
            "Grill chicken breast and slice into strips",
            "Wash and prepare mixed greens",
            "Slice cucumber and halve cherry tomatoes",
            "Crumble feta cheese",
            "Combine all ingredients in a large bowl",
            "Drizzle with olive oil and toss gently"
        ],
    },
    {
        title: "Tofu Scramble Power Breakfast",
        ingredients: [
            { name: "Firm tofu", grams: 200 },
            { name: "Spinach", grams: 50 },
            { name: "Mushrooms", grams: 60 },
            { name: "Bell pepper", grams: 60 },
            { name: "Nutritional yeast", grams: 10 },
            { name: "Whole wheat toast", grams: 60 },
            { name: "Olive oil", grams: 10 },
        ],
        time: "12 minutes",
        calories: "380 kcal",
        price: "$7.49",
        img: "/RecipeImages/TofuScramble.png",
        macros: { kcal: 380, protein: 28, carbs: 32, fat: 18 },
        steps: [
            "Drain and crumble firm tofu",
            "Heat olive oil in a pan over medium heat",
            "Add tofu and nutritional yeast, cook for 5 minutes",
            "Add diced bell pepper and mushrooms, cook 3 minutes",
            "Stir in spinach until wilted",
            "Toast whole wheat bread and serve scramble on top"
        ],
    },
];