<x-filament-panels::page>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {{-- Étudiants --}}
        <div class="col-span-full">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">👨‍🎓 Étudiants</h2>
        </div>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Total inscrits</p>
                <p class="text-4xl font-bold text-primary-600">{{ $this->getStats()['total_etudiants'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Avec psy référent</p>
                <p class="text-4xl font-bold text-success-600">{{ $this->getStats()['etudiants_avec_psy'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Sans psy référent</p>
                <p class="text-4xl font-bold text-warning-600">{{ $this->getStats()['etudiants_sans_psy'] }}</p>
            </div>
        </x-filament::card>

        {{-- Psychothérapeutes --}}
        <div class="col-span-full mt-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">👨‍⚕️ Psychothérapeutes</h2>
        </div>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Total</p>
                <p class="text-4xl font-bold text-primary-600">{{ $this->getStats()['total_psy'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Disponibles</p>
                <p class="text-4xl font-bold text-success-600">{{ $this->getStats()['psy_disponibles'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Urgences</p>
                <p class="text-4xl font-bold text-warning-600">{{ $this->getStats()['psy_urgence'] }}</p>
            </div>
        </x-filament::card>

        {{-- Consultations --}}
        <div class="col-span-full mt-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">📅 Consultations</h2>
        </div>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Total</p>
                <p class="text-4xl font-bold text-primary-600">{{ $this->getStats()['total_consultations'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">En attente</p>
                <p class="text-4xl font-bold text-warning-600">{{ $this->getStats()['en_attente'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">En cours</p>
                <p class="text-4xl font-bold text-info-600">{{ $this->getStats()['en_cours'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Terminées</p>
                <p class="text-4xl font-bold text-success-600">{{ $this->getStats()['terminees'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Refusées</p>
                <p class="text-4xl font-bold text-danger-600">{{ $this->getStats()['refusees'] }}</p>
            </div>
        </x-filament::card>

        {{-- Ressources --}}
        <div class="col-span-full mt-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">📚 Ressources</h2>
        </div>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Total</p>
                <p class="text-4xl font-bold text-primary-600">{{ $this->getStats()['total_ressources'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">En attente modération</p>
                <p class="text-4xl font-bold text-warning-600">{{ $this->getStats()['ressources_en_attente'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Publiées</p>
                <p class="text-4xl font-bold text-success-600">{{ $this->getStats()['ressources_actives'] }}</p>
            </div>
        </x-filament::card>

        {{-- Autres --}}
        <div class="col-span-full mt-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">🔄 Transferts & Sponsors</h2>
        </div>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Transferts en attente</p>
                <p class="text-4xl font-bold text-warning-600">{{ $this->getStats()['transferts_en_attente'] }}</p>
            </div>
        </x-filament::card>

        <x-filament::card>
            <div class="text-center">
                <p class="text-sm text-gray-500">Sponsors actifs</p>
                <p class="text-4xl font-bold text-success-600">{{ $this->getStats()['total_sponsors'] }}</p>
            </div>
        </x-filament::card>

    </div>

    {{-- Bouton Export PDF --}}
    <div class="mt-6 flex justify-end">
        <a href="{{ route('dashboard.export.pdf') }}"
           target="_blank"
           class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            📄 Exporter en PDF
        </a>
    </div>

</x-filament-panels::page>
