<script setup lang="ts">
import { useTitle, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";
import { watch } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { isDark } from "../composables/dark";

useTitle("Login | Stock Digest");

const { loginWithPopup, isAuthenticated } = useAuth0();
const login = () => loginWithPopup();

const toggleDark = useToggle(isDark);

const { push } = useRouter();
if (isAuthenticated.value) {
    push({ name: "Home" });
}

watch(isAuthenticated, (newState) => {
    if (newState === true) {
        push({ name: "Home" });
    }
});
</script>

<template>
    <div class="h-screen flex items-center justify-center py-12 px-8">
        <div class="max-w-md w-full space-y-8 my-auto">
            <h2
                class="mt-6 text-center text-3xl font-extrabold text-black dark:text-white"
            >
                Stock Digest
            </h2>

            <button
                type="button"
                class="w-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ring-gray-200 dark:ring-gray-800"
                @click.prevent="login"
            >
                Sign in
            </button>
        </div>

        <div
            class="absolute bottom-7 left-7 flex flex-col text-grey-900 dark:text-gray-400 text-sm pr-6 select-none"
        >
            <button type="button" class="text-left" @click="() => toggleDark()">
                Switch theme
            </button>

            <span class="mt-2">
                Copyright &copy; {{ new Date().getFullYear() }}
                <a
                    href="https://unisontech.org"
                    target="_blank"
                    class="underline"
                    >UNISON Technologies, Inc</a
                >. All rights reserved.
            </span>
            <span class="mt-2">
                By using this site, you agree to the use of cookies for the sole
                purpose of maintaining your login state.
            </span>
        </div>
    </div>
</template>
