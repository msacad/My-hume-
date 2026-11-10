# Somaliland Driving Simulator – Extracted Asset Starter Pack

This pack is prepared from the supplied 1672×941 RGBA atlas. It includes individually named PNG reference crops, the original atlas, and an asset manifest with source coordinates.

## Important production note
These are atlas crops, not fully hand-masked production sprites. Some crops intentionally retain nearby pixels, transparent padding, or atlas background. Before shipping, inspect each PNG, refine alpha masks, and rebuild any combined strip crops (for example road barriers/cones) into separate objects. The original atlas is preserved for reference.

## Folders
- `assets/vehicles/` – vehicle reference crops
- `assets/flags/` – Somaliland flag crops
- `assets/signs/` – direction and traffic sign crops
- `assets/environment/` – buildings, trees, hills and rocks
- `assets/ui/` – HUD, touch controls and menu icon crops
- `assets/props/` – roadside barriers and cones
- `assets/city_previews/` – city/menu preview references (not 3D geometry)
- `assets/atlas/` – original source atlas

## Google AI Studio workflow
1. Upload this ZIP to your Google AI Studio project.
2. Read `GOOGLE_AI_STUDIO_MASTER_PROMPT.txt` and paste it as the build instruction.
3. Ask the model to validate every asset path and create a generated asset catalog before implementing scenes.
4. Build the game in stages; do not pretend 2D crops are 3D models. Use them as UI sprites/reference textures and create or source proper 3D meshes for vehicles and environments.

No audio files or 3D model files were present in the original ZIP, so those must be generated or added separately.
