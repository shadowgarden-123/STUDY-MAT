import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { Category, Mode } from "./config/campus";
import { normalizeText } from "./lib/normalize";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

type SeedListing = {
  title: string;
  description: string;
  category: Category;
  mode: Mode;
  price?: number;
  exchange?: string;
  location: string;
  ageHours: number;
};

/**
 * Données de démonstration, idempotentes. Les comptes ne sont pas des comptes
 * de connexion : ce sont les propriétaires des annonces du campus.
 */
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const marker = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "awa@univ-share.ci"))
      .unique();
    if (marker) return { seeded: false };

    const now = Date.now();
    const insertUser = async (
      displayName: string,
      level: string,
      email: string,
    ) =>
      await ctx.db.insert("users", {
        name: displayName,
        displayName,
        level,
        email,
        isVerifiedStudent: true,
      });

    const awa = await insertUser("Awa K.", "Licence 2 MIAGE", "awa@univ-share.ci");
    const yao = await insertUser("Yao M.", "Master 1", "yao@univ-share.ci");
    const mariam = await insertUser(
      "Mariam T.",
      "Licence 3",
      "mariam@univ-share.ci",
    );
    const ibrahim = await insertUser(
      "Ibrahim S.",
      "Licence 2",
      "ibrahim@univ-share.ci",
    );

    const definitions: Array<SeedListing & { owner: Id<"users"> }> = [
      {
        owner: yao,
        title: "Algorithmique et structures de données, 3e édition",
        description:
          "Livre en bon état, avec quelques notes au crayon. Utile pour les cours de Licence 1 et Licence 2 MIAGE. À récupérer entre 12 h et 14 h devant la bibliothèque.",
        category: "livres",
        mode: "don",
        location: "Bâtiment B",
        ageHours: 2,
      },
      {
        owner: ibrahim,
        title: "Kit Arduino Uno et câbles",
        description:
          "Carte Arduino Uno R3, câble USB et une dizaine de câbles Dupont. Je m'en suis servi pour un projet de capteurs, tout fonctionne.",
        category: "electronique",
        mode: "echange",
        exchange: "une plaque d'essai",
        location: "Résidence",
        ageHours: 4,
      },
      {
        owner: mariam,
        title: "Polycopié de Réseaux, L2",
        description:
          "Support complet du cours avec les schémas et les exercices corrigés. Relié proprement, aucune page manquante.",
        category: "cours",
        mode: "prix",
        price: 500,
        location: "Amphi",
        ageHours: 6,
      },
      {
        owner: yao,
        title: "Blouse de labo, taille M",
        description:
          "Blouse blanche en coton, portée deux fois pour les TP de chimie. Lavée, sans tache. Je la laisse au Bâtiment C.",
        category: "labo",
        mode: "don",
        location: "Bâtiment C",
        ageHours: 9,
      },
      {
        owner: ibrahim,
        title: "Plaque d'essai et résistances",
        description:
          "Une plaque d'essai 830 points et un sachet de résistances variées. De quoi tenir tout le semestre.",
        category: "electronique",
        mode: "don",
        location: "Résidence",
        ageHours: 12,
      },
      {
        owner: mariam,
        title: "Cours de Systèmes d'exploitation, L2",
        description:
          "Notes de cours complètes, avec les TD de processus et de mémoire. Je cherche les annales d'analyse en échange.",
        category: "cours",
        mode: "echange",
        exchange: "les annales d'analyse L2",
        location: "Bibliothèque",
        ageHours: 20,
      },
      {
        owner: yao,
        title: "Calculatrice Casio fx-991",
        description:
          "Fonctionne très bien. À récupérer à l'amphi, entre deux cours.",
        category: "electronique",
        mode: "prix",
        price: 2000,
        location: "Amphi",
        ageHours: 26,
      },
      {
        owner: mariam,
        title: "Le Petit Robert de la langue française",
        description:
          "Édition de 2019, dos solide, quelques surlignages dans la partie noms communs. Pour les dissertations et les exposés.",
        category: "livres",
        mode: "don",
        location: "Bibliothèque",
        ageHours: 30,
      },
      {
        owner: awa,
        title: "Annales d'examens, Analyse L2",
        description:
          "Sujets corrigés de 2022 à 2025, agrafés par chapitre. J'ai fini mes partiels, elles peuvent servir.",
        category: "cours",
        mode: "don",
        location: "Bâtiment A",
        ageHours: 36,
      },
      {
        owner: ibrahim,
        title: "Éprouvettes graduées et gants nitrile",
        description:
          "Trois éprouvettes 100 ml et une boîte de gants taille M presque pleine. Échange contre une blouse taille M.",
        category: "labo",
        mode: "echange",
        exchange: "une blouse taille M",
        location: "Bâtiment C",
        ageHours: 44,
      },
      {
        owner: mariam,
        title: "Manuel de biologie cellulaire, 2e édition",
        description:
          "Manuel de L1 avec les planches illustrées. Couverture un peu cornée, intérieur impeccable.",
        category: "livres",
        mode: "prix",
        price: 1500,
        location: "Bibliothèque",
        ageHours: 55,
      },
      {
        owner: awa,
        title: "Multiprise et rallonge 3 m",
        description:
          "Multiprise 5 prises avec interrupteur et rallonge de 3 mètres. Parfait pour la résidence ou les travaux de groupe.",
        category: "electronique",
        mode: "don",
        location: "Résidence",
        ageHours: 70,
      },
      {
        owner: ibrahim,
        title: "Fiches de révision de Statistiques descriptives",
        description:
          "Quatre fiches manuscrites bien lisibles : moyennes, médianes, écart-type, tableaux croisés. Avec deux annales corrigées.",
        category: "cours",
        mode: "don",
        location: "Bâtiment A",
        ageHours: 90,
      },
      {
        owner: mariam,
        title: "Bécher 250 ml et lunettes de protection",
        description:
          "Bécher en verre borosilicaté et lunettes de protection transparentes. Utilisés pour deux TP, en très bon état.",
        category: "labo",
        mode: "prix",
        price: 1000,
        location: "Bâtiment C",
        ageHours: 110,
      },
      {
        owner: yao,
        title: "Dictionnaire anglais-français",
        description:
          "Dictionnaire de poche, 40 000 entrées. Je l'avais acheté pour les cours d'anglais technique.",
        category: "livres",
        mode: "don",
        location: "Bibliothèque",
        ageHours: 720,
      },
    ];

    const ids = new Map<string, Id<"listings">>();
    for (const definition of definitions) {
      const id = await ctx.db.insert("listings", {
        userId: definition.owner,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        mode: definition.mode,
        priceFcfa: definition.mode === "prix" ? definition.price : undefined,
        exchangeWanted:
          definition.mode === "echange" ? definition.exchange : undefined,
        location: definition.location,
        status: "disponible",
        searchText: normalizeText(
          `${definition.title} ${definition.description} ${definition.category} ${definition.location}`,
        ),
        publishDurationMs: 48_000 + definitions.indexOf(definition) * 7_000,
        createdAt: now - definition.ageHours * HOUR,
      });
      ids.set(definition.title, id);
    }

    const dictionary = ids.get("Dictionnaire anglais-français");
    if (dictionary) {
      await ctx.db.patch(dictionary, {
        status: "donne",
        givenToUserId: awa,
        givenAt: now - 72 * HOUR,
        createdAt: now - 168 * HOUR,
      });
    }

    const addConversation = async (
      listingKey: string,
      requesterId: Id<"users">,
      ownerId: Id<"users">,
      messages: Array<{
        from: "requester" | "owner";
        body: string;
        minutesAgo: number;
        unread?: boolean;
      }>,
    ) => {
      const listingId = ids.get(listingKey);
      if (!listingId || messages.length === 0) return;
      const createdAt = now - Math.max(...messages.map((m) => m.minutesAgo)) * MINUTE;
      const updatedAt = now - Math.min(...messages.map((m) => m.minutesAgo)) * MINUTE;
      const conversationId = await ctx.db.insert("conversations", {
        listingId,
        requesterId,
        ownerId,
        createdAt,
        updatedAt,
      });
      for (const message of messages) {
        await ctx.db.insert("messages", {
          conversationId,
          senderId: message.from === "requester" ? requesterId : ownerId,
          body: message.body,
          kind: "text",
          createdAt: now - message.minutesAgo * MINUTE,
          readAt: message.unread ? undefined : now - message.minutesAgo * MINUTE + 5 * MINUTE,
        });
      }
    };

    await addConversation(
      "Algorithmique et structures de données, 3e édition",
      awa,
      yao,
      [
        {
          from: "requester",
          body: "Bonjour, le livre est toujours disponible ?",
          minutesAgo: 150,
        },
        {
          from: "owner",
          body: "Oui. Je suis devant la bibliothèque à 13 h.",
          minutesAgo: 130,
        },
        {
          from: "requester",
          body: "Parfait, j'arrive. Merci beaucoup !",
          minutesAgo: 90,
        },
      ],
    );

    await addConversation("Blouse de labo, taille M", mariam, yao, [
      {
        from: "requester",
        body: "Bonjour, la blouse taille M est toujours dispo ?",
        minutesAgo: 200,
      },
      {
        from: "owner",
        body: "Oui, je la laisse au Bâtiment C demain à 10 h.",
        minutesAgo: 60,
        unread: true,
      },
    ]);

    await addConversation("Polycopié de Réseaux, L2", ibrahim, mariam, [
      {
        from: "requester",
        body: "Je peux te donner les 500 FCFA demain à l'amphi ?",
        minutesAgo: 300,
      },
      {
        from: "owner",
        body: "Ça marche, 13 h devant l'amphi.",
        minutesAgo: 280,
      },
    ]);

    await addConversation("Kit Arduino Uno et câbles", awa, ibrahim, [
      {
        from: "requester",
        body: "Bonjour, ton kit Arduino m'intéresse. J'ai une plaque d'essai à échanger.",
        minutesAgo: 400,
      },
      {
        from: "owner",
        body: "Parfait, ça m'arrange. On se retrouve à la Résidence ?",
        minutesAgo: 380,
      },
    ]);

    await addConversation("Dictionnaire anglais-français", mariam, yao, [
      {
        from: "requester",
        body: "Bonjour, le dictionnaire est encore disponible ?",
        minutesAgo: 4300,
      },
      {
        from: "owner",
        body: "Désolé, il est déjà parti.",
        minutesAgo: 4280,
      },
    ]);

    const kit = ids.get("Kit Arduino Uno et câbles");
    if (kit) {
      await ctx.db.insert("favorites", {
        userId: awa,
        listingId: kit,
        createdAt: now - 3 * HOUR,
      });
    }
    const book = ids.get("Algorithmique et structures de données, 3e édition");
    if (book) {
      await ctx.db.insert("favorites", {
        userId: mariam,
        listingId: book,
        createdAt: now - 5 * HOUR,
      });
    }

    await ctx.db.insert("events", {
      anonId: "seed-visitor-001",
      name: "visit_home",
      createdAt: now - 26 * HOUR,
    });
    await ctx.db.insert("events", {
      anonId: "seed-visitor-002",
      name: "view_listing",
      createdAt: now - 20 * HOUR,
    });

    return { seeded: true };
  },
});

/**
 * Deux fils crédibles pour la personne qui vient de créer son profil : la
 * messagerie est ainsi démontrable dès la première visite.
 */
export const bootstrapForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { created: 0 };

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .take(1);
    if (existing.length > 0) return { created: 0 };

    const available = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "disponible"))
      .order("desc")
      .take(20);
    const candidates = available.filter((listing) => listing.userId !== userId);
    const now = Date.now();
    let created = 0;
    const usedOwners = new Set<Id<"users">>();

    for (const listing of candidates) {
      if (created >= 2) break;
      if (usedOwners.has(listing.userId)) continue;
      const owner = await ctx.db.get(listing.userId);
      if (!owner) continue;
      usedOwners.add(listing.userId);
      const ownerFirstName = (owner.displayName ?? "l'étudiant").split(" ")[0];
      const conversationId = await ctx.db.insert("conversations", {
        listingId: listing._id,
        requesterId: userId,
        ownerId: listing.userId,
        createdAt: now - (created === 0 ? 26 : 5) * HOUR,
        updatedAt: now - (created === 0 ? 25 : 4) * HOUR,
      });
      await ctx.db.insert("messages", {
        conversationId,
        senderId: userId,
        body:
          created === 0
            ? `Bonjour, ton annonce « ${listing.title} » est toujours disponible ?`
            : `Bonjour ${ownerFirstName}, je suis intéressé par « ${listing.title} ». Je peux passer cette semaine.`,
        kind: "text",
        createdAt: now - (created === 0 ? 26 : 5) * HOUR,
        readAt: now - (created === 0 ? 25 : 4) * HOUR,
      });
      await ctx.db.insert("messages", {
        conversationId,
        senderId: listing.userId,
        body:
          created === 0
            ? "Oui, toujours. Je peux te le remettre demain entre 12 h et 14 h."
            : "Bonjour, oui. Je te le garde jusqu'à vendredi, on se retrouve sur le campus.",
        kind: "text",
        createdAt: now - (created === 0 ? 25 : 4) * HOUR,
      });
      created += 1;
    }

    return { created };
  },
});
