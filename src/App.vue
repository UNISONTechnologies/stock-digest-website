<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";

const route = useRoute();
const { isLoading } = useAuth0();
</script>

<template>
    <div
        v-if="!isLoading"
        class="max-w-7xl mx-auto"
        :class="{ 'pt-6 px-8 md:px-0 pb-20': route.name !== 'Login' }"
    >
        <router-view />
    </div>

    <div v-else class="h-screen flex items-center justify-center py-12 px-8">
        <div
            class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"
        />
    </div>
</template>
