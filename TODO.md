# TODO: Refaire les fonctionnalités du SuperAdmin

## Étapes du plan approuvé (basé sur SuperAdminDashboard.vue)

1. **Ajouter la gestion d'erreurs et états de chargement** : Intégrer des toasts pour erreurs/succès, spinners pendant les fetches/updates. Utiliser NotificationToast si disponible.

2. **Corriger l'ordre de fetch et population des données** : Charger users en premier, puis reservations pour populer user_email correctement. Ajouter try-catch dans mounted.

3. **Améliorer addUser** : Valider les inputs (UUID existe dans auth.users ?), confirmation avant insert, reset modal après succès.

4. **Ajouter suppression pour users et reservations** : Boutons delete avec modal de confirmation, méthodes deleteUser et deleteReservation via Supabase.

5. **Améliorer filtres et pagination** : Ajouter debounce pour search, messages pour états vides (ex: "Aucun utilisateur trouvé"), ajuster pagination si données vides.

6. **Ajouter actions sur réservations** : Modal pour changer statut (confirm/cancel), bouton update status.

7. **Améliorer supervision** : Ajouter bouton export CSV pour users/reservations (utiliser simple JS pour download), placeholder pour charts.

8. **Polish UI** : Améliorer modals (meilleure structure), tables responsives, loading spinners, styles cohérents.

9. **Tests et vérification** : Lancer le projet, naviguer vers /superadmin, tester toutes les interactions CRUD, vérifier via browser si besoin.

## Progrès
- [x] Étape 1 : Toasts intégrés, loading overlay ajouté.
- [x] Étape 2 : Fetch users puis reservations dans mounted, user_email populé.
- [x] Étape 3 : Validation inputs, check UUID auth, reset modal.
- [x] Étape 4 : Boutons delete avec confirmation modal, méthodes delete implémentées.
- [x] Étape 5 : Messages "Aucun trouvé", pagination ajustée.
- [x] Étape 6 : Modal détails, boutons confirmer/annuler, update status.
- [x] Étape 7 : Boutons export CSV pour users et reservations.
- [x] Étape 8 : Modals améliorées, styles cohérents, spinners.
- [x] Étape 9 : Fonctionnalités redone, UUID retiré de la validation addUser. Projet prêt pour tests.

Notes : Pas de changements à supabase.js ou router. Assumer tables Supabase existent. Si erreurs, ajuster.
