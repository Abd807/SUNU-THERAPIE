<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            <div class="flex items-center gap-2">
                <x-heroicon-o-sparkles class="w-5 h-5 text-primary-500" />
                Synthèse intelligente
            </div>
        </x-slot>

        <x-slot name="description">
            Analyse de l'activité générée par l'IA — données anonymes et agrégées.
        </x-slot>

        <div class="space-y-4">
            <x-filament::button
                wire:click="genererSynthese"
                wire:loading.attr="disabled"
                icon="heroicon-o-sparkles"
            >
                <span wire:loading.remove wire:target="genererSynthese">Générer la synthèse</span>
                <span wire:loading wire:target="genererSynthese">Génération en cours…</span>
            </x-filament::button>

            @if ($synthese)
                <div class="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-gray-50 dark:bg-gray-800 whitespace-pre-line">
                    {!! $synthese !!}
                </div>
            @endif
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
