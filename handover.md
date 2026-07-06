# Codebase Audit Handover — Grade Calculator

Audit date: 2026-07-06 (Claude Code session). Stack: React (Vite) + Spring Boot + Azure (Static Web Apps frontend, SQL Server DB). No changes were made — this is a plan.

---

## Frontend Audit (`frontend/`)

### 🔴 High priority

1. **Calculator routes are not protected.** `App.jsx` imports `ProtectedRoute` but never uses it — all four calculator routes render without an auth check.
   - [ ] Wrap calculator routes: `<ProtectedRoute><MainLayout>...</MainLayout></ProtectedRoute>`

2. **No centralized API client.** `fetch` + `VITE_API_URL` + headers + `credentials: "include"` + error handling copy-pasted across AuthContext, Sidebar, and every calculator page (~10 call sites).
   - [ ] Create `src/api/client.js` — `apiFetch(path, options)` that sets base URL, JSON headers, credentials, throws on non-OK
   - [ ] Optionally split into `src/api/auth.js`, `courses.js`, `semesters.js`

3. **Failures are silent to the user.** Save/load errors only hit `console.error` (e.g. `GPACalculator.jsx` `save()`); failed saves look successful.
   - [ ] Add error state (banner/toast); replace scattered `alert()`/`window.confirm()`

### 🟡 Medium priority

4. **`React.cloneElement` prop injection is fragile.** `MainLayout.jsx` injects `selectedCourse`/`selectedSemester`/`onSave`/`reloadKey` invisibly into children.
   - [ ] Replace with a `SelectionContext`, or layout route + `<Outlet context={...}>` from react-router

5. **"Export to CGPA" does read-merge-write on the client.** `GPACalculator.jsx` `exportToGPA()` fetches all semesters, merges, PUTs the whole list back. Race-prone; business logic in UI. Same pattern in Sidebar add/rename/delete. Root cause is the backend API design (see backend #6).

6. **Auth flow rough edges in `AuthContext.jsx`:**
   - [ ] Remove `setTimeout(resolve, 100)` "wait for session" hack in `login()`
   - [ ] Only call `fetchUser()` when `check-session` returns OK
   - [ ] Remove debug `console.log`s

7. **Pick one styling approach.** Tailwind installed + directives loaded in `index.css`, but all styling is hand-written CSS files sitting in `src/` root, away from their components.
   - [ ] Adopt Tailwind or remove it (deps, `postcss.config.js`, `tailwind.config.js`, `@tailwind` directives)
   - [ ] Co-locate CSS with components (`pages/GPACalculator.css` next to its page)

### 🟢 Low priority

- [ ] `key={index}` on dynamic rows (GPACalculator etc.) — misattributes input state on row removal; use `courseID` or a stable generated id
- [ ] `handleChange` mutates state: `updatedRows[index][field] = value` — use `rows.map(...)` with spread
- [ ] No catch-all route — add `<Route path="*" ...>`; consider redirecting `/` to calculators when authenticated
- [ ] Stale `useCallback` deps (`exportToGPA` omits `API_BASE`; `loadEntries` has empty deps) — enforce exhaustive-deps lint rule
- [ ] Calculator pages share the rows/add/remove/save/load pattern — extract a `useEditableRows(resource)` hook **after** items 2 and 5
- [ ] Route naming: `/gradeCalculator` → kebab-case `/grade-calculator`
- [ ] No tests — add Vitest + RTL for grade math and auth redirect

### Frontend order of attack
1. Route protection (#1) — 10 min, real gap
2. API client (#2) — unblocks #5, #6, shared hook
3. Error surfacing (#3)
4. Styling decision + CSS co-location (#7)
5. Rest opportunistically

---

## Backend Audit (`backend/`)

### 🔴 Critical — security

1. **Passwords stored/compared in plaintext.** `UserRepository.findByEmailAndPassword(...)`; `register` saves the raw entity.
   - [ ] Add `BCryptPasswordEncoder` bean; hash on register
   - [ ] Lookup via `findByEmail` + `encoder.matches(raw, stored)`
   - [ ] Migrate/wipe existing rows

2. **`/controller/get-user` returns the full `User` entity — including the password field** (Lombok `@Getter` serializes it to JSON).
   - [ ] Return a `UserDto(id, username, email)` or `@JsonIgnore` the password

3. **Registration has no validation.**
   - [ ] Check duplicate email/username first (currently unhandled 500 on unique constraint)
   - [ ] Bind a `RegisterRequest` DTO with `@Valid` (`@Email`, `@NotBlank`, min password length) instead of the entity

### 🟡 High — structure

4. **Spring Security is `permitAll` + manual session checks duplicated in every endpoint** (all 4 controllers).
   - [ ] Minimum: extract session check into a `HandlerInterceptor`/argument resolver providing `userID`
   - [ ] Better: populate `SecurityContext` on login; switch config to `.requestMatchers(login, register).permitAll().anyRequest().authenticated()`; delete manual checks

5. **No service layer.** Controllers do auth + business logic + persistence; the ~40-line upsert/delete sync is duplicated across GPA/CGPA/Grade controllers.
   - [ ] Add `service/` (`CourseService`, `SemesterService`); one shared generic sync helper

6. **Save-full-list API design** (`PUT /save-courses` replaces the whole collection; deletes implied by omission).
   - [ ] Move to resource endpoints: `GET/POST /api/courses`, `PUT/DELETE /api/courses/{id}` — eliminates the frontend's client-side merge (frontend #5). **Change both sides in one branch.**

7. **No global error handling.** `orElseThrow(RuntimeException)` → raw 500s; error bodies inconsistent (plain strings vs `Map.of("error", ...)` — frontend `resp.json()` throws on the string ones).
   - [ ] `@RestControllerAdvice` with a consistent JSON error shape and proper status codes

### 🟢 Medium / polish

- [ ] Rename `Controller` → `AuthController`; `/controller/...` → `/api/auth/...`; prefix all APIs with `/api/`
- [ ] ID type mismatch: `JpaRepository<User, Long>` vs `Integer userID` (`userID.longValue()` conversions) — standardize on `Long`
- [ ] Prod `spring.jpa.hibernate.ddl-auto=update` → `validate` + Flyway migrations
- [ ] Prod `spring.jpa.show-sql=true` → off
- [ ] CORS origins hardcoded in `SecurityConfig` → config property
- [ ] `RowDto.grade` is `Float` but `Course.grade` is primitive `float` — null grade NPEs on unboxing; validate/default
- [ ] In-memory sessions (`spring.session.store-type=none`) — restarts log everyone out; single-instance only. Upgrade path: JDBC/Redis Spring Session
- [ ] CSRF disabled + `SameSite=None` cookies is the vulnerable combo — known tradeoff for now; fixed by token auth or Spring cookie-based CSRF
- [ ] Drop `sessionId` from the login response body (cookie already carries it)
- [ ] Tests: unit tests for sync logic + `@WebMvcTest` for auth once service layer exists

### Backend order of attack
1. Password hashing + stop leaking password field (#1, #2) — **do first; app is publicly deployed**
2. Registration validation + global error handler (#3, #7)
3. Centralize auth (#4) — deletes ~80 lines of duplication
4. Service layer (#5), then REST redesign (#6) — coordinate #6 with frontend API-client work
5. Config polish (Flyway, show-sql, CORS property)

---

## Cross-cutting note

The two audits intersect at the **full-list PUT sync**: backend #6 and frontend #2/#5 should land together in one branch (new REST endpoints + new frontend API client) so neither side is stranded.
