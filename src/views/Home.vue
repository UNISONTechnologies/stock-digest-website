<script setup lang="ts">
/* eslint-disable vue/no-v-html */

import { onBeforeMount, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";
import { useTitle, useToggle } from "@vueuse/core";
import { isDark } from "../composables/dark";
import { useDatabase } from "../composables/database";
import { useTimer } from "vue-timer-hook";
import feather from "feather-icons";
import type { DatabaseUser } from "../models";

import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogOverlay,
    DialogTitle,
    Popover,
    PopoverButton,
    PopoverPanel,
} from "@headlessui/vue";

const { push } = useRouter();
const { isAuthenticated, user, logout: auth0Logout } = useAuth0();

const logout = () => {
    auth0Logout({ returnTo: window.location.origin });
};

if (!isAuthenticated.value) {
    push({ name: "Login" });
}

useTitle("Stock Digest");
const toggleDark = useToggle(isDark);

const resetPasswordConfirmationDialog = ref<boolean>(false);
const resetPasswordNotification = ref<boolean>(false);
const resetPassword = async () => {
    console.debug("Resetting password...");

    let url = `https://${
        import.meta.env.VITE_AUTH0_DOMAIN as string
    }/dbconnections/change_password`;

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
            email: user.value.email,
            connection: "Username-Password-Authentication",
        }),
    });

    resetPasswordNotification.value = true;
};

const {
    getUserDetails,
    updateUserDetails,
    deleteUser: dbDeleteUser,
} = useDatabase();
const userDetails = ref<DatabaseUser | null>(null);
const deleteUser = async (userId: string) => {
    await dbDeleteUser(userId);

    if (user.value) {
        userDetails.value = await getUserDetails(user.value.sub as string);
    }
};

const editSymbolsDialog = ref<boolean>(false);
const newSymbol = ref<string>("");
const addSymbol = async () =>
    userDetails.value &&
    newSymbol.value.trim() !== "" &&
    userDetails.value.symbols.push(newSymbol.value.trim().toUpperCase()) &&
    (await updateUserDetails(userDetails.value));
const removeSymbol = async (index: number) =>
    userDetails.value &&
    userDetails.value.symbols.splice(index, 1) &&
    (await updateUserDetails(userDetails.value));

const digestDeletionConfirmationDialog = ref<boolean>(false);

const smallerIcon = (icon: string, newSize = 16) =>
    icon.replace(
        'width="24" height="24"',
        `width="${newSize}" height="${newSize}"`,
    );

const getNextWorkDay = (date: Date) => {
    let day = date.getDay();
    let add = 1;

    if (day === 5) {
        add = 3;
    } else if (day === 6) {
        add = 2;
    }

    date.setDate(date.getDate() + add);
    return date;
};

let nextDigestDate = ref<Date>(getNextWorkDay(new Date()));
const timer = nextDigestDate.value
    ? useTimer(nextDigestDate.value.setUTCHours(21, 15, 0), true)
    : null;

onBeforeMount(
    async () =>
        user.value &&
        (userDetails.value = await getUserDetails(user.value.sub as string)),
);

watchEffect(async () => {
    if (timer && timer.isExpired.value) {
        nextDigestDate.value = getNextWorkDay(new Date());
        if (nextDigestDate.value) {
            timer.restart(nextDigestDate.value.setUTCHours(21, 15, 0), true);
        }
    }
});
</script>

<template>
    <div class="max-w-2xl mx-auto py-8 sm:py-10 sm:px-6 lg:px-8">
        <header>
            <div class="flex items-center justify-between">
                <div class="flex-1 flex flex-col">
                    <h2
                        class="text-3xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate mb-0.5 select-none"
                    >
                        Stock Digest
                    </h2>
                </div>
                <div class="flex space-x-3">
                    <button
                        type="button"
                        class="rounded-lg text-gray-700 dark:text-gray-300 p-2 focus:outline-none focus:ring-2"
                        @click="() => toggleDark()"
                        v-html="feather.icons[isDark ? 'moon' : 'sun'].toSvg()"
                    />
                    <button
                        type="button"
                        class="rounded-lg text-red-600 p-2 focus:outline-none focus:ring-2"
                        @click="logout"
                        v-html="feather.icons['log-out'].toSvg()"
                    />
                </div>
            </div>
        </header>

        <main class="mt-4 space-y-8">
            <div v-if="user" class="space-y-4">
                <h3 class="text-gray-800 dark:text-gray-200 flex items-center">
                    <span class="flex-1 text-xl font-semibold">
                        Global Settings
                    </span>

                    <Popover class="relative">
                        <PopoverButton>
                            <span
                                v-html="
                                    smallerIcon(
                                        feather.icons['help-circle'].toSvg(),
                                        20,
                                    )
                                "
                            />
                        </PopoverButton>

                        <transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="translate-y-1 opacity-0"
                            enter-to-class="translate-y-0 opacity-100"
                            leave-active-class="transition duration-150 ease-in"
                            leave-from-class="translate-y-0 opacity-100"
                            leave-to-class="translate-y-1 opacity-0"
                        >
                            <PopoverPanel
                                class="absolute z-10 w-screen max-w-xs px-4 mt-3 -translate-x-1/2 left-1/2"
                            >
                                <div
                                    class="overflow-hidden rounded-lg shadow-lg"
                                >
                                    <div
                                        class="p-4 bg-gray-200 dark:bg-gray-800 text-grey-900 dark:text-gray-400 text-sm"
                                    >
                                        <p>
                                            Global settings refer to settings
                                            that are for your UT account
                                        </p>
                                    </div>
                                </div>
                            </PopoverPanel>
                        </transition>
                    </Popover>
                </h3>

                <div
                    v-if="!user.email_verified"
                    class="bg-yellow-400 rounded-lg p-5 flex space-x-3 items-center"
                >
                    <span v-html="feather.icons['alert-triangle'].toSvg()" />

                    <span class="text-black">
                        Your email is unverified. Please search your inbox for
                        an email from Status Quotes (no-reply@auth0user.net) to
                        verify your email. Contact
                        <a
                            :href="`mailto:hkamran@hkamran.com?subject=Status%20Quotes%20-%20Verification%20Email&body=${encodeURIComponent(
                                user.email as string,
                            )}`"
                            target="_blank"
                            class="underline"
                            >support</a
                        >
                        if an error occurs or you can't find the email.
                    </span>
                </div>

                <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5">
                    <div
                        class="text-gray-600 dark:text-gray-500 text-sm mb-0.5"
                    >
                        Name
                    </div>
                    <span
                        class="text-black dark:text-white"
                        v-text="user.name"
                    />
                </div>

                <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5">
                    <div
                        class="text-gray-600 dark:text-gray-500 text-sm mb-0.5"
                    >
                        Email
                    </div>
                    <span
                        class="text-black dark:text-white"
                        v-text="user.email"
                    />
                </div>

                <button
                    type="button"
                    class="w-full text-left bg-gray-100 dark:bg-gray-900 rounded-lg p-5"
                    @click="resetPasswordConfirmationDialog = true"
                >
                    <span class="text-black dark:text-white">
                        Reset Password
                    </span>
                </button>
            </div>

            <div v-if="user && userDetails" class="space-y-4">
                <h3 class="text-gray-800 dark:text-gray-200 flex items-center">
                    <span class="flex-1 text-xl font-semibold">
                        Stock Digest Settings
                    </span>

                    <Popover class="relative">
                        <PopoverButton>
                            <span
                                v-html="
                                    smallerIcon(
                                        feather.icons['help-circle'].toSvg(),
                                        20,
                                    )
                                "
                            />
                        </PopoverButton>

                        <transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="translate-y-1 opacity-0"
                            enter-to-class="translate-y-0 opacity-100"
                            leave-active-class="transition duration-150 ease-in"
                            leave-from-class="translate-y-0 opacity-100"
                            leave-to-class="translate-y-1 opacity-0"
                        >
                            <PopoverPanel
                                class="absolute z-10 w-screen max-w-xs px-4 mt-3 -translate-x-1/2 left-1/2"
                            >
                                <div
                                    class="overflow-hidden rounded-lg shadow-lg"
                                >
                                    <div
                                        class="p-4 bg-gray-200 dark:bg-gray-800 text-grey-900 dark:text-gray-400 text-sm"
                                    >
                                        <p>
                                            Settings exclusively for Stock
                                            Digest
                                        </p>
                                    </div>
                                </div>
                            </PopoverPanel>
                        </transition>
                    </Popover>
                </h3>

                <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5">
                    <div
                        class="flex text-gray-600 dark:text-gray-500 text-sm mb-0.5 items-center"
                    >
                        <span class="flex-1"> Stocks </span>
                        <span
                            class="hover:cursor-pointer"
                            @click="editSymbolsDialog = true"
                            v-html="
                                smallerIcon(feather.icons['edit-2'].toSvg())
                            "
                        />
                    </div>

                    <div class="space-y-2 flex-wrap justify-left">
                        <span
                            v-for="stock in userDetails.symbols"
                            :key="stock"
                            class="uppercase text-xs font-light text-black dark:text-white px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg inline-block mr-2"
                            v-text="stock"
                        />
                    </div>
                </div>

                <div
                    v-if="nextDigestDate && timer"
                    class="bg-gray-100 dark:bg-gray-900 rounded-lg p-5"
                >
                    <div
                        class="text-gray-600 dark:text-gray-500 text-sm mb-0.5"
                    >
                        Next Digest
                    </div>

                    <div class="text-black dark:text-white">
                        <p>
                            <time
                                :datetime="nextDigestDate.toISOString()"
                                v-text="
                                    new Date(nextDigestDate).toLocaleString(
                                        undefined,
                                        {
                                            dateStyle: 'full',
                                            timeStyle: 'short',
                                        },
                                    )
                                "
                            />
                        </p>

                        <p>
                            <time
                                :datetime="`P${timer.days.value}DT${timer.hours.value}H${timer.minutes.value}M${timer.seconds.value}S`"
                            >
                                {{ timer.days }} day{{
                                    timer.days.value !== 1 ? "s" : ""
                                }}, {{ timer.hours }} hour{{
                                    timer.hours.value !== 1 ? "s" : ""
                                }}, {{ timer.minutes }} minute{{
                                    timer.minutes.value !== 1 ? "s" : ""
                                }}
                            </time>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    class="w-full text-left bg-gray-100 dark:bg-gray-900 rounded-lg p-5"
                    @click="digestDeletionConfirmationDialog = true"
                >
                    <span class="text-black dark:text-white">
                        Delete Stock Digest Data
                    </span>
                </button>
            </div>
        </main>

        <div
            class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end"
        >
            <transition
                enter-active-class="transition ease-in duration-100"
                enter-from-class="translate-x-10 opacity-0"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="translate-x-0 opacity-100"
                leave-to-class="translate-x-10 opacity-0"
            >
                <div
                    v-if="resetPasswordNotification"
                    class="max-w-sm w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
                    @click="resetPasswordNotification = false"
                >
                    <div class="p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <span
                                    class="h-6 w-6 text-green-600"
                                    v-html="
                                        feather.icons['alert-triangle'].toSvg()
                                    "
                                />
                            </div>
                            <div class="ml-3 w-0 flex-1 pt-0.5">
                                <p
                                    class="text-sm font-medium text-black dark:text-white"
                                >
                                    Password reset email sent!
                                </p>
                            </div>
                            <div class="ml-4 flex-shrink-0 flex">
                                <button
                                    class="bg-white dark:bg-gray-900 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    @click="resetPasswordNotification = false"
                                >
                                    <span class="sr-only">Close</span>
                                    <span v-html="feather.icons.x.toSvg()" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <TransitionRoot
            appear
            :show="resetPasswordConfirmationDialog"
            as="template"
        >
            <Dialog as="div" @close="resetPasswordConfirmationDialog = false">
                <div
                    class="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-60"
                >
                    <div class="min-h-screen px-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <DialogOverlay class="fixed inset-0" />
                        </TransitionChild>

                        <span
                            class="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <div
                                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-lg"
                            >
                                <DialogTitle
                                    as="h3"
                                    class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100"
                                >
                                    Reset Password
                                </DialogTitle>
                                <div
                                    class="my-4 space-y-2 text-gray-500 dark:text-gray-400"
                                >
                                    <p class="text-sm">
                                        Are you sure you want to reset your
                                        password? This action is irreversible.
                                    </p>
                                </div>
                                <div
                                    class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
                                >
                                    <button
                                        type="button"
                                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="
                                            resetPasswordConfirmationDialog = false;
                                            resetPassword();
                                        "
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="button"
                                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        @click="
                                            resetPasswordConfirmationDialog = false
                                        "
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot
            v-if="userDetails"
            appear
            :show="editSymbolsDialog"
            as="template"
        >
            <Dialog as="div" @close="editSymbolsDialog = false">
                <div
                    class="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-60"
                >
                    <div class="min-h-screen px-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <DialogOverlay class="fixed inset-0" />
                        </TransitionChild>

                        <span
                            class="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <div
                                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-lg"
                            >
                                <DialogTitle
                                    as="h3"
                                    class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100 flex"
                                >
                                    <span class="flex-1"> Edit Stocks </span>
                                    <span
                                        class="hover:cursor-pointer"
                                        @click="editSymbolsDialog = false"
                                        v-html="feather.icons.x.toSvg()"
                                    />
                                </DialogTitle>
                                <div
                                    class="mt-4 space-y-3 text-gray-500 dark:text-gray-400"
                                >
                                    <div
                                        v-for="(
                                            symbol, index
                                        ) in userDetails.symbols"
                                        :key="symbol"
                                        class="flex"
                                    >
                                        <span class="flex-1" v-text="symbol" />
                                        <span
                                            class="hover:cursor-pointer hover:text-red-600"
                                            @click="removeSymbol(index)"
                                            v-html="
                                                smallerIcon(
                                                    feather.icons[
                                                        'trash-2'
                                                    ].toSvg(),
                                                    18,
                                                )
                                            "
                                        />
                                    </div>

                                    <div
                                        class="w-full border-b-2 border-gray-300 dark:border-gray-700"
                                    />

                                    <div class="flex items-center space-x-4">
                                        <label
                                            class="flex-1 flex flex-col space-y-1"
                                        >
                                            <span class="text-sm font-medium">
                                                Stock Symbol
                                            </span>
                                            <input
                                                v-model="newSymbol"
                                                type="text"
                                                placeholder="AAPL"
                                                class="text-sm leading-5 w-full py-2 px-3 border-2 dark:border-gray-700 text-slate-500 rounded-lg shadow-sm focus:outline-none dark:hover:border-gray-600 dark:focus:border-gray-600 dark:text-slate-400 dark:placeholder:text-slate-600 dark:bg-gray-900 uppercase"
                                                @keyup.enter="
                                                    addSymbol();
                                                    newSymbol = '';
                                                "
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            class="hover:cursor-pointer disabled:hover:cursor-auto hover:text-gray-600 dark:hover:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-600"
                                            :disabled="newSymbol.trim() === ''"
                                            @click="
                                                addSymbol();
                                                newSymbol = '';
                                            "
                                            v-html="
                                                smallerIcon(
                                                    feather.icons.plus.toSvg(),
                                                    18,
                                                )
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <TransitionRoot
            v-if="user && userDetails"
            appear
            :show="digestDeletionConfirmationDialog"
            as="template"
        >
            <Dialog as="div" @close="digestDeletionConfirmationDialog = false">
                <div
                    class="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-60"
                >
                    <div class="min-h-screen px-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <DialogOverlay class="fixed inset-0" />
                        </TransitionChild>

                        <span
                            class="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <div
                                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-lg"
                            >
                                <DialogTitle
                                    as="h3"
                                    class="text-xl font-medium leading-6 text-gray-900 dark:text-gray-100"
                                >
                                    Delete Stock Digest Data
                                </DialogTitle>
                                <div
                                    class="my-4 space-y-2 text-gray-500 dark:text-gray-400 text-sm"
                                >
                                    <p>
                                        Are you sure you want to delete your
                                        Stock Digest data? This action is
                                        irreversible.
                                    </p>
                                    <p>
                                        If you want to sign up again for Stock
                                        Digest in the future, you must re-create
                                        your Stock Digest data.
                                    </p>
                                </div>
                                <div
                                    class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"
                                >
                                    <button
                                        type="button"
                                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        @click="
                                            digestDeletionConfirmationDialog = false;
                                            deleteUser(user.sub as string);
                                        "
                                    >
                                        Delete
                                    </button>

                                    <button
                                        type="button"
                                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        @click="
                                            digestDeletionConfirmationDialog = false
                                        "
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>
