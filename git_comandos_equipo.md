
# Comandos Git útiles para el equipo

Este documento contiene los comandos Git que más utilizamos en el proyecto y otros adicionales que podrían sernos útiles para el trabajo en equipo con ramas remotas.

---

## 🔄 Configuración inicial (solo una vez por repositorio)

```bash
git init
```
Inicializa un repositorio Git en el directorio actual.

git remote add origin <URL>

Vincula tu proyecto local con el repositorio remoto de GitHub.

---

## 📂 Gestión de ramas

```bash
git branch
```
Muestra todas las ramas locales y cuál estás usando actualmente.

```bash
git checkout <rama>
```
Cambia de rama.

```bash
git checkout -b <nueva-rama>
```
Crea una nueva rama y cambia a ella inmediatamente.

---

## 💾 Guardar y subir cambios

```bash
git add .
```
Agrega todos los archivos modificados al "staging area".

```bash
git commit -m "Mensaje del commit"
```
Registra los cambios en la historia del repositorio.

```bash
git push origin <rama>
```
Sube tus cambios de la rama actual al repositorio remoto.

---

## 🔁 Obtener y fusionar cambios del remoto

```bash
git fetch
```
Trae todos los cambios del remoto sin fusionarlos.

```bash
git pull
```
Trae los cambios remotos **y los fusiona** automáticamente con tu rama actual.

```bash
git merge origin/<otra-rama>
```
Funde los cambios de otra rama remota en tu rama actual.

---

## 🔍 Ver diferencias y estado

```bash
git status
```
Muestra los archivos modificados y los que están por ser añadidos.

```bash
git diff
```
Muestra los cambios que aún no han sido añadidos (`git add`).

```bash
git diff origin/<rama>
```
Compara tu rama actual con una rama remota.

---

## 🧹 Revisión y limpieza

```bash
git log --oneline
```
Muestra el historial de commits en una sola línea por commit.

```bash
git stash
```
Guarda cambios no comprometidos para volver a una versión limpia de tu rama.

```bash
git stash pop
```
Recupera los cambios que habías guardado con `stash`.

---

## 🧪 Otros útiles

```bash
git reset --hard HEAD
```
Revierte todos los cambios locales no guardados (¡peligroso! úsalo con cuidado).

```bash
git clone <URL>
```
Clona un repositorio remoto a tu máquina local.

```bash
git push --set-upstream origin <rama>
```
Usado la primera vez que subes una nueva rama al remoto.

---

## 🛠 Flujo recomendado para trabajar en equipo

1. `git checkout -b <mi-rama>` – crear una rama para tus cambios
2. `git add .` + `git commit -m "mensaje"`
3. `git push origin <mi-rama>`
4. Avisar a tus compañeros o hacer una Pull Request si es necesario
5. Para fusionar cambios: `git fetch` → `git merge origin/<otra-rama>`

---
