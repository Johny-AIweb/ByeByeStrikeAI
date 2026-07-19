import React, { useState, useEffect, useRef } from "react";
import { 
  Music, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  History, 
  Volume2, 
  SlidersHorizontal, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle,
  Shield,
  Trash2, 
  ExternalLink,
  Disc,
  Clock,
  Shuffle,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

interface AnalysisResult {
  id: string;
  original_song: string;
  artworkUrl?: string;
  bpm: number;
  genre: string;
  mood: string;
  vocal_style: string;
  instruments: string[];
  musical_key: string;
  ai_music_prompt: string;
  description?: string;
  description_cs?: string;
  lyrical_theme?: string;
  lyrical_theme_cs?: string;
  timestamp: string;
  is_remix?: boolean;
  remix_details?: string;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" }
];

const NAV_LABELS: Record<string, { welcome: string; console: string }> = {
  cs: { welcome: "Úvod", console: "Konzole" },
  sk: { welcome: "Úvod", console: "Konzola" },
  pl: { welcome: "Wstęp", console: "Konsola" },
  de: { welcome: "Intro", console: "Konsole" },
  ru: { welcome: "Интро", console: "Консоль" },
  es: { welcome: "Inicio", console: "Consola" },
  pt: { welcome: "Início", console: "Console" },
  en: { welcome: "Intro", console: "Console" }
};

const LOADING_STEPS: Record<string, string[]> = {
  cs: [
    "Iniciuji analýzu zvukové stopy...",
    "Dekóduji audio DNA a tónové spektrum...",
    "Izoluji vokální stopy a formanty...",
    "Analyzuji rytmické vzorce a BPM...",
    "Identifikuji chráněné akordové progrese...",
    "Převádím na legální remake...",
    "Syntetizuji popis bez ochranných známek...",
    "Optimalizuji prompt pro AI generátory (Suno/Udio)...",
    "Finální sanitace a leštění promptu..."
  ],
  en: [
    "Initiating audio track analysis...",
    "Decoding audio DNA and tonal spectrum...",
    "Isolating vocal tracks and formants...",
    "Analyzing rhythmic patterns and BPM...",
    "Identifying copyrighted chord progressions...",
    "Converting into a legal remake...",
    "Synthesizing trademark-free description...",
    "Optimizing prompt for AI generators (Suno/Udio)...",
    "Final sanitation and prompt polishing..."
  ],
  sk: [
    "Iniciujem analýzu zvukovej stopy...",
    "Dekódujem audio DNA a tónové spektrum...",
    "Izolujem vokálne stopy a formanty...",
    "Analyzujem rytmické vzorce a BPM...",
    "Identifikujem chránené akordové progresie...",
    "Prevádzam na legálny remake...",
    "Syntetizujem popis bez ochranných známok...",
    "Optimalizujem prompt pre AI generátory (Suno/Udio)...",
    "Finálna sanitácia a leštenie promptu..."
  ],
  pl: [
    "Inicjowanie analizy ścieżki dźwiękowej...",
    "Dekodowanie audio DNA i spektrum tonalnego...",
    "Izolowanie ścieżek wokalnych i formantów...",
    "Analiza wzorców rytmicznych i BPM...",
    "Identyfikacja chronionych progresji akordów...",
    "Konwersja na legalny remake...",
    "Syntetyzowanie opisu wolnego od znaków towarowych...",
    "Optymalizacja monitu dla generatorów AI (Suno/Udio)...",
    "Końcowa sanitacja i dopracowanie monitu..."
  ],
  de: [
    "Initiere Audiospur-Analyse...",
    "Dekodiere Audio-DNA und Tonspektrum...",
    "Isoliere Gesangsspuren und Formanten...",
    "Analysiere rhythmische Muster und BPM...",
    "Identifiziere urheberrechtlich geschützte Akkordfolgen...",
    "In ein legales Remake umwandeln...",
    "Synthetisiere markenfreie Beschreibung...",
    "Prompt für KI-Generatoren (Suno/Udio) optimieren...",
    "Letzte Bereinigung und Verfeinerung des Prompts..."
  ],
  ru: [
    "Запуск анализа аудиодорожки...",
    "Декодирование аудио-ДНК и тонального спектра...",
    "Изоляция вокальных партий и формант...",
    "Анализ ритмических паттернов и BPM...",
    "Определение защищенных авторским правом аккордов...",
    "Преобразование в легальный ремейк...",
    "Создание описания без торговых марок...",
    "Оптимизация промпта для ИИ-генераторов (Suno/Udio)...",
    "Финальная очистка и полировка промпта..."
  ],
  es: [
    "Iniciando el análisis de la pista de audio...",
    "Decodificando el ADN de audio y el espectro tonal...",
    "Aislando pistas de voz y formantes...",
    "Analizando patrones rítmicos y BPM...",
    "Identificando progresiones de acordes protegidas...",
    "Convirtiendo en un remake legal...",
    "Sintetizando descripción libre de marcas registradas...",
    "Optimitzando el prompt para generadores de IA (Suno/Udio)...",
    "Saneamiento final y pulido del prompt..."
  ],
  pt: [
    "Iniciando a análise da faixa de áudio...",
    "Decodificando o DNA do áudio e o espectro tonal...",
    "Isolando faixas vocais e formantes...",
    "Analisando padrões rítmicos e BPM...",
    "Identificando progressões de acordes protegidas...",
    "Convertendo em um remake legal...",
    "Sintetizando descrição livre de marcas registradas...",
    "Otimizando o prompt para geradores de IA (Suno/Udio)...",
    "Saneamento final e polimento do prompt..."
  ]
};

const TERMS_CONTENT: Record<string, any> = {
  cs: {
    title: "Podmínky užití",
    disclaimerTitle: "Omezení odpovědnosti (Disclaimer)",
    disclaimerText: "ByeByeStrike AI není propojená, sponzorovaná ani nijak přidružená k platformám Suno, Udio, YouTube nebo k jakýmkoli hudebním vydavatelstvím.",
    definitionTitle: "Definice služby",
    definitionText: "Tento web slouží výhradně jako vzdělávací a analytický nástroj, nikoli pirátský software. Nástroj provádí pouze textovou transformaci a analýzu hudební teorie (tempo, tónina, žánrový popis). Nevytváří audio soubory, nekopíruje melodie a neporušuje autorská práva.",
    responsibilityTitle: "Odpovědnost uživatele",
    responsibilityText: "Uživatel nese plnou odpovědnost za to, jakým způsobem vygenerovaný textový prompt použije na platformách třetích stran a jak naloží s výsledným audiem.",
    fairUseTitle: "Zákaz zneužití (Fair Use)",
    fairUseText: "Služba slouží výhradně pro inspiraci a překonání tvůrčího bloku hudebních tvůrců.",
    close: "Zavřít"
  },
  sk: {
    title: "Podmienky užívania",
    disclaimerTitle: "Obmedzenie zodpovednosti (Disclaimer)",
    disclaimerText: "ByeByeStrike AI nie je prepojená, sponzorovaná ani nijak pridružená k platformám Suno, Udio, YouTube alebo k akýmkoľvek hudobným vydavateľstvám.",
    definitionTitle: "Definícia služby",
    definitionText: "Tento web slúži výhradne ako vzdelávací a analytický nástroj, nie pirátsky softvér. Nástroj vykonáva iba textovú transformáciu a analýzu hudobnej teórie (tempo, tónina, žánrový popis). Nevytvára audio súbory, nekopíruje melódie a neporušuje autorské práva.",
    responsibilityTitle: "Zodpovednosť užívateľa",
    responsibilityText: "Užívateľ nesie plnú zodpovednosť za to, akým spôsobem vygenerovaný textový prompt použije na platformách tretích strán a ako naloží s výsledným audiom.",
    fairUseTitle: "Zákaz zneužitia (Fair Use)",
    fairUseText: "Služba slúži výhradne pre inšpiráciu a prekonanie tvorivého bloku hudobných tvorcov.",
    close: "Zavrieť"
  },
  en: {
    title: "Terms of Use",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "ByeByeStrike AI is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Suno, Udio, YouTube, or any music publishers/record labels.",
    definitionTitle: "Service Definition",
    definitionText: "This website acts purely as an educational and analytical tool, not as piracy software. The tool only performs text transformation and music theory analysis (tempo, key, genre description). It does not generate audio files, copy melodies, or infringe on copyrights.",
    responsibilityTitle: "User Responsibility",
    responsibilityText: "The user bears full responsibility for how they use the generated text prompts on third-party platforms and how they handle the resulting audio.",
    fairUseTitle: "Fair Use",
    fairUseText: "This service is intended solely for creative inspiration and overcoming writer's block.",
    close: "Close"
  },
  pl: {
    title: "Warunki korzystania",
    disclaimerTitle: "Wyłączenie odpowiedzialności",
    disclaimerText: "ByeByeStrike AI nie jest powiązana, sponsorowana ani w żaden sposób powiązana z platformami Suno, Udio, YouTube ani żadnymi wydawcami muzycznymi.",
    definitionTitle: "Definicja usługi",
    definitionText: "Ta strona działa wyłącznie jako narzędzie edukacyjne i analityczne, a nie jako oprogramowanie pirackie. Narzędzie wykonuje jedynie transformację tekstu i analizę teorii muzyki (tempo, tonacja, opis gatunku). Nie generuje plików audio, nie kopiuje melodii ani nie narusza praw autorskich.",
    responsibilityTitle: "Odpowiedzialność użytkownika",
    responsibilityText: "Użytkownik ponosi pełną odpowiedzialność za sposób użycia wygenerowanych promptów tekstowych na platformach stron trzecich oraz za sposób postępowania z powstałym dźwiękiem.",
    fairUseTitle: "Dozwolony użytek (Fair Use)",
    fairUseText: "Usługa ta jest przeznaczona wyłącznie do inspiracji twórczej i pokonywania blokady pisarskiej.",
    close: "Zamknij"
  },
  de: {
    title: "Nutzungsbedingungen",
    disclaimerTitle: "Haftungsausschluss",
    disclaimerText: "ByeByeStrike AI ist nicht mit Suno, Udio, YouTube oder Musikverlagen/Plattenlabels verbunden, gesponsert oder in irgendeiner Weise offiziell verbunden.",
    definitionTitle: "Service-Definition",
    definitionText: "Diese Website dient rein als Bildungs- und Analysetool, nicht als Piraterie-Software. Das Tool führt lediglich Texttransformationen und musiktheoretische Analysen (Tempo, Tonart, Genre-Beschreibung) durch. Es erzeugt keine Audiodateien, kopiert keine Melodien und verletzt keine Urheberrechte.",
    responsibilityTitle: "Benutzerverantwortung",
    responsibilityText: "Der Benutzer trägt die volle Verantwortung dafür, wie er die generierten Text-Prompts auf Plattformen von Drittanbietern verwendet und wie er mit den resultierenden Audiodateien umgeht.",
    fairUseTitle: "Fair Use",
    fairUseText: "Dieser Dienst ist ausschließlich für die kreative Inspiration und zur Überwindung von Schreibblockaden gedacht.",
    close: "Schließen"
  },
  ru: {
    title: "Условия использования",
    disclaimerTitle: "Отказ от ответственности",
    disclaimerText: "ByeByeStrike AI не связана, не спонсируется и никоим образом официально не связана с платформами Suno, Udio, YouTube или какими-либо музыкальными издательствами.",
    definitionTitle: "Определение услуги",
    definitionText: "Этот веб-сайт является исключительно образовательным и аналитическим инструментом, а не пиратским ПО. Инструмент выполняет только текстовую трансформацию и анализ теории музыки (темп, тональность, описание жанра). Он не создает аудиофайлы, не копирует мелодии и не нарушает авторские права.",
    responsibilityTitle: "Responsibility пользователя",
    responsibilityText: "Пользователь несет полную ответственность за то, как он использует созданные текстовые подсказки на сторонних платформах и как он распоряжается полученным аудио.",
    fairUseTitle: "Добросовестное использование (Fair Use)",
    fairUseText: "Этот сервис предназначен исключительно для творческого вдохновения и преодоления творческого кризиса.",
    close: "Закрыть"
  },
  es: {
    title: "Condiciones de uso",
    disclaimerTitle: "Descargo de responsabilidad",
    disclaimerText: "ByeByeStrike AI no está vinculada, patrocinada ni afiliada de ninguna manera con las plataformas Suno, Udio, YouTube o cualquier sello discográfico o editorial musical.",
    definitionTitle: "Definición del servicio",
    definitionText: "Este sitio web actúa puramente como una herramienta educativa y analítica, no como software de piratería. La herramienta solo realiza transformación de texto y análisis de teoría musical (tempo, tono, descripción de género). No genera archivos de audio, no copia melodías y no infringe derechos de autor.",
    responsibilityTitle: "Responsabilidad del usuario",
    responsibilityText: "El usuario asume la total responsabilidad por la forma en que utiliza los prompts de texto generados en plataformas de terceros y por cómo maneja el audio resultante.",
    fairUseTitle: "Uso Justo (Fair Use)",
    fairUseText: "Este servicio está destinado únicamente a la inspiración creativa y a superar el bloqueo del escritor.",
    close: "Cerrar"
  },
  pt: {
    title: "Termos de Uso",
    disclaimerTitle: "Isenção de Responsabilidade",
    disclaimerText: "A ByeByeStrike AI não é afiliada, patrocinada ou de alguma forma associada às plataformas Suno, Udio, YouTube ou a quaisquer editoras musicais ou gravadoras.",
    definitionTitle: "Definição de Serviço",
    definitionText: "Este site funciona puramente como uma ferramenta educacional e analítica, e não como software de pirataria. A ferramenta realiza apenas transformação de texto e análise de teoria musical (tempo, tom, descrição de gênero). Não gera arquivos de áudio, não copia melodias e não infringe direitos autorais.",
    responsibilityTitle: "Responsabilidade do Usuário",
    responsibilityText: "O usuário assume total responsabilidade pela forma como utiliza os prompts de texto gerados em plataformas de terceiros e como lida com o áudio resultante.",
    fairUseTitle: "Uso Justo (Fair Use)",
    fairUseText: "Este serviço destina-se exclusivamente à inspiração criativa e a superar o bloqueio criativo.",
    close: "Fechar"
  }
};

const SUPPORT_CONTENT: Record<string, any> = {
  cs: {
    title: "Podpora a DMCA",
    needHelpTitle: "POTŘEBUJETE POMOC NEBO CHCETE NAHLÁSIT PROBLÉM?",
    needHelpText: "Pro zákaznickou podporu, požadavky na funkce nebo obchodní dotazy nás kontaktujte na adrese: webstrikeai@gmail.com",
    copyrightTitle: "AUTORSKÁ PRÁVA A DMCA ODSTRANĚNÍ",
    copyrightText: "Pokud jste vlastníkem autorských práv a domníváte se, že vygenerovaný prompt věrně napodobuje vaše chráněné dílo, napište nám e-mail s podrobnostmi o skladbě. Vaši žádost zkontrolujeme a skladbu z naší databáze okamžitě zablokujeme.",
    close: "Zavřít"
  },
  sk: {
    title: "Podpora a DMCA",
    needHelpTitle: "POTREBUJETE POMOC ALEBO CHCETE NAHLÁSIŤ PROBLÉM?",
    needHelpText: "Pre zákaznícku podporu, požiadavky na funkcie alebo obchodné otázky nás kontaktujte na adrese: webstrikeai@gmail.com",
    copyrightTitle: "AUTORSKÉ PRÁVA A DMCA ODSTRÁNENIE",
    copyrightText: "Ak ste vlastníkom autorských práv a domnievate sa, že vygenerovaný prompt verne napodobňuje vaše chránené dielo, napíšte nám e-mail s podrobnosťami o skladbe. Vašu žiadosť skontrolujeme a skladbu z našej databázy okamžite zablokujeme.",
    close: "Zatvoriť"
  },
  en: {
    title: "Support & DMCA",
    needHelpTitle: "NEED HELP OR WANT TO REPORT AN ISSUE?",
    needHelpText: "For customer support, feature requests, or business inquiries, contact us at: webstrikeai@gmail.com",
    copyrightTitle: "COPYRIGHT & DMCA TAKEDOWN",
    copyrightText: "If you are a copyright owner and believe a generated prompt closely mimics your protected work, please email us with the track details. We will review your request and block the track from our database immediately.",
    close: "Close"
  },
  pl: {
    title: "Wsparcie i DMCA",
    needHelpTitle: "POTRZEBUJESZ POMOCY LUB CHCESZ ZGŁOSIĆ PROBLEM?",
    needHelpText: "W przypadku wsparcia klienta, wniosków o nowe funkcje lub zapytań biznesowych prosimy o kontakt pod adresem: webstrikeai@gmail.com",
    copyrightTitle: "PRAWA AUTORSKIE I USUWANIE DMCA",
    copyrightText: "Jeśli jesteś właścicielem praw autorskich i uważasz, że wygenerowany prompt dokładnie naśladuje Twoje chronione dzieło, napisz do nas e-mail ze szczegółami utworu. Przeanalizujemy Twoją prośbę i natychmiast zablokujemy utwór w naszej bazie danych.",
    close: "Zamknij"
  },
  de: {
    title: "Support & DMCA",
    needHelpTitle: "BENÖTIGEN SIE HILFE ODER WOLLEN SIE EIN PROBLEM MELDEN?",
    needHelpText: "Für Kundensupport, Feature-Anfragen oder geschäftliche Anfragen kontaktieren Sie uns unter: webstrikeai@gmail.com",
    copyrightTitle: "URHEBERRECHT & DMCA-ABMAHNUNG",
    copyrightText: "Wenn Sie ein Urheberrechtsinhaber sind und der Ansicht sind, dass ein generierter Prompt Ihr geschütztes Werk stark nachahmt, senden Sie uns bitte eine E-Mail mit den Details des Titels. Wir werden Ihre Anfrage prüfen und den Titel umgehend aus unserer Datenbank sperren.",
    close: "Schließen"
  },
  ru: {
    title: "Поддержка и DMCA",
    needHelpTitle: "НУЖНА ПОМОЩЬ ИЛИ ХОТИТЕ СООБЩИТЬ О ПРОБЛЕМЕ?",
    needHelpText: "Для поддержки клиентов, запросов функций или деловых запросов свяжитесь с нами по адресу: webstrikeai@gmail.com",
    copyrightTitle: "АВТОРСКОЕ ПРАВО И УДАЛЕНИЕ DMCA",
    copyrightText: "Если вы являетесь владельцем авторских прав и считаете, что созданный промпт близко имитирует вашу защищенную работу, отправьте нам электронное письмо с подробным описанием трека. Мы рассмотрим ваш запрос и немедленно заблокируем трек в нашей базе данных.",
    close: "Закрыть"
  },
  es: {
    title: "Soporte y DMCA",
    needHelpTitle: "¿NECESITA AYUDA O QUIERE REPORTAR UN PROBLEMA?",
    needHelpText: "Para soporte al cliente, solicitudes de funciones o consultas comerciales, contáctenos en: webstrikeai@gmail.com",
    copyrightTitle: "DERECHOS DE AUTOR Y RETIRADA DMCA",
    copyrightText: "Si es propietario de derechos de autor y cree que un prompt generado imita de cerca su trabajo protegido, envíenos un correo electrónico con los detalles de la pista. Revisaremos su solicitud y bloquearemos la pista de nuestra base de datos de inmediato.",
    close: "Cerrar"
  },
  pt: {
    title: "Suporte e DMCA",
    needHelpTitle: "PRECISA DE AJUDA OU QUER REPORTAR UM PROBLEMA?",
    needHelpText: "Para suporte ao cliente, solicitações de recursos ou consultas comerciais, entre em contato conosco em: webstrikeai@gmail.com",
    copyrightTitle: "DIREITOS AUTORAIS E RETIRADA DMCA",
    copyrightText: "Se você for o proprietário dos direitos autorais e acreditar que um prompt gerado imita de perto o seu trabalho protegido, envie um e-mail com os detalhes da faixa. Analisaremos sua solicitação e bloquearemos a faixa de nosso banco de dados imediatamente.",
    close: "Fechar"
  }
};

const PRIVACY_CONTENT: Record<string, any> = {
  cs: {
    title: "Cookies a ochrana osobních údajů (GDPR)",
    cookiesTitle: "POUŽÍVÁNÍ SOUBORŮ COOKIES",
    cookiesText: "Tento web používá soubory cookies k zajištění základní funkčnosti webu (uložení historie převodů, jazykových preferencí a nastavení konzole). Nepoužíváme sledovací ani reklamní cookies třetích stran pro invazivní profilování.",
    gdprTitle: "OCHRANA OSOBNÍCH ÚDAJŮ (GDPR)",
    gdprText: "Respektujeme vaše soukromí. ByeByeStrike AI neshromažďuje ani neukládá žádné osobní údaje uživatelů kromě technických dat nezbytných pro běh aplikace (např. dočasný stav relace). Veškeré historie konverzí se ukládají lokálně ve vašem prohlížeči (localStorage) a můžete je kdykoli smazat.",
    rightsTitle: "VAŠE PRÁVA",
    rightsText: "Máte právo na přístup ke svým datům, jejich opravu či vymazání. Vzhledem k tomu, že neprovozujeme žádné uživatelské účty a neukládáme data na našich serverech, jsou veškerá data plně pod vaší kontrolou ve vašem prohlížeči. Pro případné dotazy nás kontaktujte na adrese webstrikeai@gmail.com.",
    close: "Zavřít"
  },
  sk: {
    title: "Cookies a ochrana osobných údajov (GDPR)",
    cookiesTitle: "POUŽÍVANIE SÚBOROV COOKIES",
    cookiesText: "Tento web používa súbory cookies na zaistenie základnej funkčnosti webu (uloženie histórie prevodov, jazykových preferencií a nastavení konzoly). Nepoužívame sledovacie ani reklamné cookies tretích strán na invazívne profilovanie.",
    gdprTitle: "OCHRANA OSOBNÝCH ÚDAJOV (GDPR)",
    gdprText: "Rešpektujeme vaše súkromie. ByeByeStrike AI nezhromažďuje ani neukladá žiadne osobné údaje používateľov okrem technických dát nevyhnutných pre beh aplikácie (napr. dočasný stav relácie). Všetky histórie konverzií sa ukladajú lokálne vo vašom prehliadači (localStorage) a môžete ich kedykoľvek zmazať.",
    rightsTitle: "VAŠE PRÁVA",
    rightsText: "Máte právo na prístup k svojim dátam, ich opravu či vymazanie. Vzhľadom na to, že neprevádzkujeme žiadne užívateľské účty a neukladáme dáta na našich serveroch, sú všetky dáta plne pod vašou kontrolou vo vašom prehliadači. Pre prípadné otázky nás kontaktujte na adrese webstrikeai@gmail.com.",
    close: "Zatvoriť"
  },
  en: {
    title: "Cookies & Privacy Policy (GDPR)",
    cookiesTitle: "USAGE OF COOKIES",
    cookiesText: "This website uses cookies to ensure basic website functionality (saving conversion history, language preferences, and console settings). We do not use third-party tracking or advertising cookies for invasive profiling.",
    gdprTitle: "PRIVACY POLICY (GDPR)",
    gdprText: "We respect your privacy. ByeByeStrike AI does not collect or store any personal data of users except for technical data necessary for running the application (such as temporary session states). All conversion histories are stored locally in your browser (localStorage) and you can delete them at any time.",
    rightsTitle: "YOUR RIGHTS",
    rightsText: "You have the right to access, rectify, or erase your data. Since we do not run user accounts or store personal data on our servers, all data is fully under your control in your local browser. For any inquiries, please contact us at webstrikeai@gmail.com.",
    close: "Close"
  },
  pl: {
    title: "Pliki cookies i ochrona prywatności (RODO)",
    cookiesTitle: "KORZYSTANIE Z PLIKÓW COOKIES",
    cookiesText: "Ta witryna używa plików cookies w celu zapewnienia podstawowej funkcjonalności strony (zapisywanie historii konwersji, preferencji językowych i ustawień konsoli). Nie używamy śledzących ani reklamowych plików cookies stron trzecich do inwazyjnego profilowania.",
    gdprTitle: "OCHRONA DANYCH OSOBOWYCH (RODO)",
    gdprText: "Szanujemy Twoją prywatność. ByeByeStrike AI nie zbiera ani nie przechowuje żadnych danych osobowych użytkowników poza danymi technicznymi niezbędnymi do działania aplikacji (np. tymczasowy stan sesji). Cała historia konwersji jest przechowywana lokalnie w Twojej przeglądarce (localStorage) i możesz ją usunąć w dowolnym momencie.",
    rightsTitle: "TWOJE PRAWA",
    rightsText: "Masz prawo do dostępu do swoich danych, ich poprawiania lub usunięcia. Ponieważ nie prowadzimy kont użytkowników ani nie przechowujemy danych na naszych serwerach, wszystkie dane są w pełni pod Twoją kontrolą w Twojej przeglądarce. W razie pytań prosimy o kontakt pod adresem webstrikeai@gmail.com.",
    close: "Zamknij"
  },
  de: {
    title: "Cookies & Datenschutz (DSGVO)",
    cookiesTitle: "VERWENDUNG VON COOKIES",
    cookiesText: "Diese Website verwendet Cookies, um die grundlegende Funktionalität der Website zu gewährleisten (Speichern des Konvertierungsverlaufs, Spracheinstellungen und Konsoleneinstellungen). Wir verwenden keine Tracking- oder Werbe-Cookies von Drittanbietern für offensives Profiling.",
    gdprTitle: "DATENSCHUTZERKLÄRUNG (DSGVO)",
    gdprText: "Wir respektieren Ihre Privatsphäre. ByeByeStrike AI sammelt oder speichert keine personenbezogenen Daten von Nutzern, außer technischen Daten, die für den Betrieb der Anwendung erforderlich sind (z. B. temporärer Sitzungsstatus). Alle Konvertierungsverläufe werden lokal in Ihrem Browser (localStorage) gespeichert und können von Ihnen jederzeit gelöscht werden.",
    rightsTitle: "IHRE RECHTE",
    rightsText: "Sie haben das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten. Da wir keine Benutzerkonten führen oder personenbezogene Daten auf unseren Servern speichern, liegen alle Daten vollständig unter Ihrer Kontrolle in Ihrem lokalen Browser. Bei Fragen kontaktieren Sie uns bitte unter webstrikeai@gmail.com.",
    close: "Schließen"
  },
  ru: {
    title: "Файлы cookies и конфиденциальность (GDPR)",
    cookiesTitle: "ИСПОЛЬЗОВАНИЕ ФАЙЛОВ COOKIES",
    cookiesText: "Этот сайт использует файлы cookies для обеспечения базовой функциональности (сохранение истории конверсий, языковых предпочтений и настроек консоли). Мы не используем сторонние отслеживающие или рекламные файлы cookies для инвазивного профилирования.",
    gdprTitle: "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ (GDPR)",
    gdprText: "Мы уважаем вашу конфиденциальность. ByeByeStrike AI не собирает и не хранит никакие персональные данные пользователей, за исключением технических данных, необходимых для работы приложения (например, временное состояние сессии). Вся история конверсий хранится локально в вашем браузере (localStorage) и может быть удалена вами в любое время.",
    rightsTitle: "ВАШИ ПРАВА",
    rightsText: "Вы имеете право на доступ к своим данным, их исправление или удаление. Поскольку мы не ведем учетные записи пользователей и не храним данные на наших серверах, все данные полностью находятся под вашим контролем в вашем локальном браузере. По всем вопросам обращайтесь к нам по адресу webstrikeai@gmail.com.",
    close: "Закрыть"
  },
  es: {
    title: "Cookies y privacidad (GDPR)",
    cookiesTitle: "USO DE COOKIES",
    cookiesText: "Este sitio web utiliza cookies para garantizar la funcionalidad básica del sitio (guardar el historial de conversiones, las preferencias de idioma y la configuración de la consola). No utilizamos cookies de seguimiento o publicidad de terceros para perfiles invasivos.",
    gdprTitle: "POLÍTICA DE PRIVACIDAD (GDPR)",
    gdprText: "Respetamos su privacidad. ByeByeStrike AI no recopila ni almacena ningún dato personal de los usuarios, excepto los datos técnicos necesarios para ejecutar la aplicación (como los estados de sesión temporales). Todos los historiales de conversión se almacenan localmente en su navegador (localStorage) y puede eliminarlos en cualquier momento.",
    rightsTitle: "SUS DERECHOS",
    rightsText: "Tiene derecho a acceder, rectificar o eliminar sus datos. Dado que no gestionamos cuentas de usuario ni almacenamos datos en nuestros servidores, todos los datos están bajo su total control en su navegador local. Para cualquier consulta, contáctenos en webstrikeai@gmail.com.",
    close: "Cerrar"
  },
  pt: {
    title: "Cookies e Privacidade (GDPR)",
    cookiesTitle: "USO DE COOKIES",
    cookiesText: "Este site usa cookies para garantir a funcionalidade básica do site (salvar histórico de conversão, preferências de idioma e configurações do console). Não usamos cookies de rastreamento ou publicidade de terceiros para perfil invasivo.",
    gdprTitle: "POLÍTICA DE PRIVACIDADE (GDPR)",
    gdprText: "Respeitamos a sua privacidade. O ByeByeStrike AI não coleta ou armazena quaisquer dados pessoais de usuários, exceto dados técnicos necessários para executar o aplicativo (como estados de sessão temporários). Todos os históricos de conversão são armazenados localmente em seu navegador (localStorage) e você pode excluí-los a qualquer momento.",
    rightsTitle: "SEUS DIREITOS",
    rightsText: "Você tem o direito de acessar, retificar ou apagar seus dados. Como não mantemos contas de usuário ou armazenamos dados em nossos servidores, todos os dados estão totalmente sob seu controle em seu navegador local. Para qualquer dúvida, entre em contato conosco em webstrikeai@gmail.com.",
    close: "Fechar"
  }
};

const COOKIE_CONSENT_TRANSLATIONS: Record<string, any> = {
  cs: {
    title: "Nastavení souborů cookies",
    text: "Tento web používá základní soubory cookies pro uložení historie, nastavení jazyka a konzole. Bez těchto cookies by aplikace nemohla správně fungovat.",
    accept: "Přijmout vše",
    decline: "Pouze nezbytné",
    privacyLink: "Zásady ochrany osobních údajů"
  },
  sk: {
    title: "Nastavenie súborov cookies",
    text: "Tento web používa základné súbory cookies na uloženie histórie, nastavenia jazyka a konzoly. Bez týchto cookies by aplikácia nemohla správne fungovať.",
    accept: "Prijať všetko",
    decline: "Iba nevyhnutné",
    privacyLink: "Zásady ochrany osobných údajov"
  },
  en: {
    title: "Cookie Settings",
    text: "This website uses essential cookies to save conversion history, language preferences, and console settings. Without these cookies, the application cannot function properly.",
    accept: "Accept All",
    decline: "Essential Only",
    privacyLink: "Privacy Policy"
  },
  pl: {
    title: "Ustawienia plików cookies",
    text: "Ta witryna używa niezbędnych plików cookies do zapisywania historii konwersji, preferencji językowych i ustawień konsoli. Bez tych plików aplikacja nie może działać poprawnie.",
    accept: "Zaakceptuj wszystko",
    decline: "Tylko niezbędne",
    privacyLink: "Polityka prywatności"
  },
  de: {
    title: "Cookie-Einstellungen",
    text: "Diese Website verwendet essenzielle Cookies, um den Konvertierungsverlauf, die Spracheinstellungen und die Konsoleneinstellungen zu speichern. Ohne diese Cookies kann die Anwendung nicht ordnungsgemäß funktionieren.",
    accept: "Alle akzeptieren",
    decline: "Nur essenzielle",
    privacyLink: "Datenschutzerklärung"
  },
  ru: {
    title: "Настройки файлов cookies",
    text: "Этот сайт использует основные файлы cookies для сохранения истории конверсий, языковых предпочтений и настроек консоли. Без этих файлов приложение не сможет работать корректно.",
    accept: "Принять все",
    decline: "Только необходимые",
    privacyLink: "Политика конфиденциальности"
  },
  es: {
    title: "Configuración de cookies",
    text: "Este sitio web utiliza cookies esenciales para guardar el historial de conversiones, las preferencias de idioma y la configuración de la consola. Sin estas cookies, la aplicación no puede funcionar correctamente.",
    accept: "Aceptar todo",
    decline: "Solo esenciales",
    privacyLink: "Política de privacidad"
  },
  pt: {
    title: "Configurações de cookies",
    text: "Este site usa cookies essenciais para salvar o histórico de conversões, preferências de idioma e configurações do console. Sem esses cookies, o aplicativo não funcionará corretamente.",
    accept: "Aceitar todos",
    decline: "Apenas essenciais",
    privacyLink: "Política de privacidade"
  }
};

const TRANSLATIONS: Record<string, any> = {
  cs: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Populární hity proměněné v bezplatné hudební prompty pro AI.",
    ctaButton: "Spustit Remake Konzoli",
    card1Title: "Audio DNA",
    card1Desc: "Přesná tvorba remake pro tempo, groove, akordovou strukturu a instrumentaci.",
    card2Title: "Lyrické adaptace",
    card2Desc: "Bezpečně převádí téma, emoční rezonanci a vyprávěcí koncept.",
    card3Title: "Přímý export",
    card3Desc: "Optimalizované prompty zkopírovatelné jedním kliknutím pro generátory.",
    studioHeading: "Nástroj Remake Studio",
    studioSubheading: "Pracovní Stanice AI",
    searchLabel: "Vyhledat Skladbu (nebo zadat ručně)",
    searchPlaceholder: "Začni psát název písničky nebo interpreta...",
    searchLabelTip: "Nápověda vzorů:",
    randomSample: "Zkusit náhodný hit",
    creativeTweaks: "Kreativní Úpravy (Remix Overrides)",
    hide: "Skrýt",
    show: "Zobrazit",
    targetGenre: "Cílový Žánr (např. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Původní žánr bude nahrazen tímto...",
    requestedBpm: "Požadované BPM",
    requestedBpmPlaceholder: "Např. 120 nebo slow",
    requestedMood: "Změna Nálady",
    requestedMoodPlaceholder: "Např. melancholy, spooky",
    vocalStyle: "Vokální Styl (např. female choir, deep voice rap)",
    vocalStylePlaceholder: "Přepište typ vokálů ve výsledném prompte",
    submitButton: "Vytvořit Remake Skladby",
    submitButtonLoading: "Pracuji na tom...",
    errorHeading: "Chyba při dekódování",
    historyTitle: "Historie konverzí",
    clearAll: "Smazat vše",
    noHistory: "Zatím jste neanalyzovali žádné skladby.",
    waitingTitle: "Čekám na vaši skladbu...",
    waitingSubtitle: "Zadejte oblíbenou chráněnou píseň. AI rozebere její mikro-strukturu, vokální tóniny, rytmický groove, textová témata a sestaví legální prompt pro generátory.",
    cardVibeTitle: "100% Remake Vibe",
    cardVibeDesc: "Prompt replikuje tón, nástroje a energii bez autorských rizik.",
    cardThemeTitle: "Lyrické Témata & Příběh",
    cardThemeDesc: "AI vytvoří remake i pro textový koncept - o čem se zpívá a jaké metafory použít.",
    loaderTitle: "Remake proces spuštěn",
    bentoSpeed: "RYCHLOST",
    bentoKey: "AKORDY & KEY",
    bentoGenre: "ŽÁNR",
    vocalStyleLabel: "Vokální Tón (Suno/Udio kompatibilní)",
    promptLabel: "Optimalizovaný hudební prompt",
    copyButton: "Zkopírovat prompt",
    copiedButton: "Zkopírováno!",
    readyTitle: "Připraveno ke generování v Suno / Udio",
    readyDesc: "Zkopírovaný prompt vložte přímo do hlavního zadávacího pole AI generátoru.",
    backToIntro: "Zpět na úvod",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Podpora",
    terms: "Podmínky užití",
    privacy: "Cookies a GDPR",
    vibeDecoded: "AUDIO DNA DEKÓDOVÁNO",
    analysisErrorEmpty: "Zadejte prosím název skladby nebo interpreta.",
    lyricsThemeLabel: "Téma Textu & Emoce",
    instrumentationLabel: "Nástroje a Produkce",
    dnaDescriptionLabel: "AI Analýza & Remake DNA"
  },
  en: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Popular hits turned into free AI music prompts.",
    ctaButton: "Launch Remake Console",
    card1Title: "Audio DNA",
    card1Desc: "Exact tempo, groove, chord structure, and instrumentation remaking.",
    card2Title: "Lyrical Adaptations",
    card2Desc: "Converts theme, emotional resonance, and storytelling concept safely.",
    card3Title: "Direct Export",
    card3Desc: "Optimized prompts copyable with one-click direct to generation platforms.",
    studioHeading: "Remake Studio Tool",
    studioSubheading: "AI Workstation",
    searchLabel: "Search Song (or enter manually)",
    searchPlaceholder: "Start typing song name or artist...",
    searchLabelTip: "Sample suggestion:",
    randomSample: "Try random hit",
    creativeTweaks: "Creative Remix Overrides",
    hide: "Hide",
    show: "Show",
    targetGenre: "Target Genre (e.g. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Original genre will be replaced by this...",
    requestedBpm: "Requested BPM",
    requestedBpmPlaceholder: "E.g. 120 or slow",
    requestedMood: "Change Mood",
    requestedMoodPlaceholder: "E.g. melancholy, spooky",
    vocalStyle: "Vocal Style (e.g. female choir, deep voice rap)",
    vocalStylePlaceholder: "Override vocal type in the final prompt",
    submitButton: "Remake Song",
    submitButtonLoading: "Working on it...",
    errorHeading: "Error decoding",
    historyTitle: "Conversion History",
    clearAll: "Clear all",
    noHistory: "You haven't analyzed any songs yet.",
    waitingTitle: "Waiting for your song...",
    waitingSubtitle: "Enter your favorite copyrighted song. AI will disassemble its micro-structure, vocal keys, rhythmic groove, lyrical themes and compile a legal prompt for generators.",
    cardVibeTitle: "100% Remade Vibe",
    cardVibeDesc: "Prompt replicates tone, instruments, and energy without copyright risks.",
    cardThemeTitle: "Lyrical Themes & Story",
    cardThemeDesc: "AI remakes the lyrical concept too - what it's about and which metaphors to use.",
    loaderTitle: "Remaking Process Initiated",
    bentoSpeed: "SPEED",
    bentoKey: "CHORDS & KEY",
    bentoGenre: "GENRE",
    vocalStyleLabel: "Vocal Tone (Suno/Udio compatible)",
    promptLabel: "Optimized Music Prompt",
    copyButton: "Copy Prompt",
    copiedButton: "Copied!",
    readyTitle: "Ready to Generate in Suno / Udio",
    readyDesc: "Paste the copied prompt directly into the main input field of your AI music generator.",
    backToIntro: "Back to Intro",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Support",
    terms: "Terms of Use",
    privacy: "Cookies & GDPR",
    vibeDecoded: "AUDIO DNA DECODED",
    analysisErrorEmpty: "Please enter a song name or artist.",
    lyricsThemeLabel: "Lyrical Theme & Emotion",
    instrumentationLabel: "Instrumentation & Production",
    dnaDescriptionLabel: "AI Analysis & Remake DNA"
  },
  sk: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Populárne hity premenené na bezplatné hudobné prompty pre AI.",
    ctaButton: "Spustiť Remake Konzolu",
    card1Title: "Audio DNA",
    card1Desc: "Presná tvorba remake pre tempo, groove, akordovú štruktúru a inštrumentáciu.",
    card2Title: "Lyrické adaptácie",
    card2Desc: "Bezpečne prevádza tému, emočnú rezonanciu a rozprávací koncept.",
    card3Title: "Priamy export",
    card3Desc: "Optimalizované prompty skopírovateľné jedným kliknutím pre generátory.",
    studioHeading: "Nástroj Remake Studio",
    studioSubheading: "Pracovná Stanica AI",
    searchLabel: "Vyhľadať Skladbu (alebo zadať ručne)",
    searchPlaceholder: "Začni písať názov pesničky alebo interpreta...",
    searchLabelTip: "Nápoveda vzorov:",
    randomSample: "Skúsiť náhodný hit",
    creativeTweaks: "Kreatívne Úpravy (Remix Overrides)",
    hide: "Skryť",
    show: "Zobraziť",
    targetGenre: "Cieľový Žáner (napr. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Pôvodný žáner bude nahradený týmto...",
    requestedBpm: "Požadované BPM",
    requestedBpmPlaceholder: "Napr. 120 alebo slow",
    requestedMood: "Zmena Nálady",
    requestedMoodPlaceholder: "Napr. melancholy, spooky",
    vocalStyle: "Vokálny Štýl (napr. female choir, deep voice rap)",
    vocalStylePlaceholder: "Prepíšte typ vokálov vo výslednom prompte",
    submitButton: "Vytvoriť Remake Skladby",
    submitButtonLoading: "Pracujem na tom...",
    errorHeading: "Chyba pri dekódovaní",
    historyTitle: "História konverzií",
    clearAll: "Zmazať všetko",
    noHistory: "Zatiaľ ste neanalyzovali žiadne skladby.",
    waitingTitle: "Čakám na vašu skladbu...",
    waitingSubtitle: "Zadajte obľúbenú chránenú pieseň. AI rozoberie jej mikro-štruktúru, vokálne tóniny, rytmický groove, textové témy a zostaví legálny prompt pre generátory.",
    cardVibeTitle: "100% Remake Vibe",
    cardVibeDesc: "Prompt replikuje tón, nástroje a energiu bez autorských rizík.",
    cardThemeTitle: "Lyrické Témy & Príbeh",
    cardThemeDesc: "AI vytvorí remake aj pre textový koncept - o čom sa spieva a aké metafory použiť.",
    loaderTitle: "Remake proces spustený",
    bentoSpeed: "RÝCHLOSŤ",
    bentoKey: "AKORDY & KEY",
    bentoGenre: "ŽÁNER",
    vocalStyleLabel: "Vokálny Tón (Suno/Udio kompatibilný)",
    promptLabel: "Optimalizovaný hudobný prompt",
    copyButton: "Skopírovať prompt",
    copiedButton: "Skopírované!",
    readyTitle: "Pripravené na generovanie v Suno / Udio",
    readyDesc: "Skopírovaný prompt vložte priamo do hlavného zadávacieho poľa AI generátora.",
    backToIntro: "Späť na úvod",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Podpora",
    terms: "Podmienky užívania",
    privacy: "Cookies a GDPR",
    vibeDecoded: "AUDIO DNA DEKÓDOVANÉ",
    analysisErrorEmpty: "Zadajte prosím názov skladby alebo interpreta.",
    lyricsThemeLabel: "Téma Textu & Emócie",
    instrumentationLabel: "Nástroje a Produkcia",
    dnaDescriptionLabel: "AI Analýza & Remake DNA"
  },
  pl: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Popularne hity zamienione w darmowe prompty muzyczne AI.",
    ctaButton: "Uruchom Konsolę Remake",
    card1Title: "Audio DNA",
    card1Desc: "Dokładne tworzenie remake'ów dla tempa, groove'u, struktury akordów i instrumentacji.",
    card2Title: "Adaptacje Liryczne",
    card2Desc: "Bezpiecznie konwertuje motyw, rezonans emocjonalny i koncepcję opowieści.",
    card3Title: "Bezpośredni Eksport",
    card3Desc: "Zoptymalizowane monity gotowe do skopiowania jednym kliknięciem do generatorów.",
    studioHeading: "Narzędzie Remake Studio",
    studioSubheading: "Stacja Robocza AI",
    searchLabel: "Wyszukaj utwór (lub wpisz ręcznie)",
    searchPlaceholder: "Zacznij wpisywać tytuł utworu lub artystę...",
    searchLabelTip: "Sugerowane przykłady:",
    randomSample: "Wypróbuj losowy hit",
    creativeTweaks: "Kreatywne modyfikacje (Remix Overrides)",
    hide: "Ukryj",
    show: "Pokaż",
    targetGenre: "Gatunek docelowy (np. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Oryginalny gatunek zostanie zastąpiony tym...",
    requestedBpm: "Wymagane BPM",
    requestedBpmPlaceholder: "Np. 120 lub slow",
    requestedMood: "Zmiana nastroju",
    requestedMoodPlaceholder: "Np. melancholy, spooky",
    vocalStyle: "Styl wokalu (np. female choir, deep voice rap)",
    vocalStylePlaceholder: "Zastąp styl wokalu w końcowym monicie",
    submitButton: "Utwórz Remake Utworu",
    submitButtonLoading: "Praca w toku...",
    errorHeading: "Błąd dekodowania",
    historyTitle: "Historia konwersji",
    clearAll: "Usuń wszystko",
    noHistory: "Nie analizowano jeszcze żadnych utworów.",
    waitingTitle: "Czekam na Twój utwór...",
    waitingSubtitle: "Wprowadź utwór chroniony prawem autorskim. AI rozłoży jego strukturę, wokale, groove i motyw na legalny monit.",
    cardVibeTitle: "W 100% bezpieczny klimat",
    cardVibeDesc: "Monit replikuje ton, instrumenty i energię bez ryzyka naruszenia praw.",
    cardThemeTitle: "Motywy liryczne i historia",
    cardThemeDesc: "AI tworzy remake również dla tekstu - o czym jest i jakich metafor użyć.",
    loaderTitle: "Rozpoczęto proces tworzenia remake'u",
    bentoSpeed: "PRĘDKOŚĆ",
    bentoKey: "AKORDY & TONACJA",
    bentoGenre: "GATUNEK",
    vocalStyleLabel: "Ton wokalu (zgodny z Suno/Udio)",
    promptLabel: "Zoptymalizowany monit muzyczny",
    copyButton: "Skopiuj monit",
    copiedButton: "Skopiowano!",
    readyTitle: "Gotowe do generowania w Suno / Udio",
    readyDesc: "Wklej skopiowany monit bezpośrednio do głównego pola wejściowego generatora AI.",
    backToIntro: "Powrót do wstępu",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Wsparcie",
    terms: "Warunki korzystania",
    privacy: "Cookies i RODO",
    vibeDecoded: "AUDIO DNA ODKODOWANE",
    analysisErrorEmpty: "Wpisz nazwę utworu lub artysty.",
    lyricsThemeLabel: "Motyw tekstu i emocje",
    instrumentationLabel: "Instrumentacja i Produkcja",
    dnaDescriptionLabel: "AI Analiza i Remake DNA"
  },
  de: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Beliebte Hits verwandelt in kostenlose KI-Musik-Prompts.",
    ctaButton: "Remake-Konsole starten",
    card1Title: "Audio DNA",
    card1Desc: "Präzises Erstellen von Remakes für Tempo, Groove, Akkordstruktur und Instrumentierung.",
    card2Title: "Lyrical-Anpassungen",
    card2Desc: "Konvertiert Thema, emotionale Resonanz und Storytelling-Konzept absolut sicher.",
    card3Title: "Direkter Export",
    card3Desc: "Optimierte Prompts mit einem Klick kopierbar für Musikgeneratoren.",
    studioHeading: "Remake Studio Werkzeug",
    studioSubheading: "AI Workstation",
    searchLabel: "Titel suchen (oder manuell eingeben)",
    searchPlaceholder: "Titel oder Künstler eingeben...",
    searchLabelTip: "Beispiel-Vorschläge:",
    randomSample: "Zufälligen Hit probieren",
    creativeTweaks: "Kreative Anpassungen (Remix Overrides)",
    hide: "Ausblenden",
    show: "Anzeigen",
    targetGenre: "Zielgenre (z. B. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Das Originalgenre wird hierdurch ersetzt...",
    requestedBpm: "Gewünschtes BPM",
    requestedBpmPlaceholder: "Z. B. 120 oder slow",
    requestedMood: "Stimmungsänderung",
    requestedMoodPlaceholder: "Z. B. melancholy, spooky",
    vocalStyle: "Gesangsstil (z. B. female choir, deep voice rap)",
    vocalStylePlaceholder: "Überschreiben Sie die Gesangsart im fertigen Prompt",
    submitButton: "Remake erstellen",
    submitButtonLoading: "In Arbeit...",
    errorHeading: "Fehler beim Dekodieren",
    historyTitle: "Verlauf",
    clearAll: "Alle löschen",
    noHistory: "Sie haben noch keine Titel analysiert.",
    waitingTitle: "Warte auf Ihren Song...",
    waitingSubtitle: "Geben Sie einen urheberrechtlich geschützten Song ein. Die KI zerlegt die Mikrostruktur, den Gesang, Groove und die Liedthemen in einen legalen Prompt.",
    cardVibeTitle: "100% Remake-Vibe",
    cardVibeDesc: "Der Prompt repliziert Ton, Instrumente und Energie ohne Urheberrechtsrisiko.",
    cardThemeTitle: "Lyrische Themen & Story",
    cardThemeDesc: "KI erstellt auch ein Remake des Textkonzepts - worum es geht und welche Metaphern verwendet werden.",
    loaderTitle: "Remake-Prozess gestartet",
    bentoSpeed: "TEMPO",
    bentoKey: "AKKORDE & TONART",
    bentoGenre: "GENRE",
    vocalStyleLabel: "Gesangston (Suno/Udio kompatibel)",
    promptLabel: "Optimierter Musik-Prompt",
    copyButton: "Prompt kopieren",
    copiedButton: "Kopiert!",
    readyTitle: "Bereit zum Generieren in Suno / Udio",
    readyDesc: "Fügen Sie den kopierten Prompt direkt in das Hauptfeld Ihres KI-Musikgenerators ein.",
    backToIntro: "Zurück zum Intro",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Support",
    terms: "Nutzungsbedingungen",
    privacy: "Cookies & DSGVO",
    vibeDecoded: "AUDIO-DNA DEKODIERT",
    analysisErrorEmpty: "Bitte geben Sie einen Songnamen oder Künstler ein.",
    lyricsThemeLabel: "Lyrisches Thema & Emotion",
    instrumentationLabel: "Instrumentierung & Production",
    dnaDescriptionLabel: "KI-Analyse & Remake-DNA"
  },
  ru: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Популярные хиты, превращенные в бесплатные музыкальные промпты для ИИ.",
    ctaButton: "Запустить консоль ремейков",
    card1Title: "Audio DNA",
    card1Desc: "Точное воссоздание темпа, ритма, структуры аккордов и инструментов без нарушения прав.",
    card2Title: "Адаптация текста",
    card2Desc: "Безопасный перенос темы, эмоционального посыла и концепции повествования.",
    card3Title: "Прямой экспорт",
    card3Desc: "Оптимизированные промпты, копируемые в один клик для генерации на платформах.",
    studioHeading: "Инструмент Remake Studio",
    studioSubheading: "Рабочая ИИ-Станция",
    searchLabel: "Найти песню (или ввести вручную)",
    searchPlaceholder: "Начните вводить название песни или артиста...",
    searchLabelTip: "Пример подсказки:",
    randomSample: "Случайный хит",
    creativeTweaks: "Творческие настройки ремикса",
    hide: "Скрыть",
    show: "Показать",
    targetGenre: "Целевой жанр (например, Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "Оригинальный жанр будет заменен на...",
    requestedBpm: "Требуемый BPM",
    requestedBpmPlaceholder: "Например, 120 или медленный",
    requestedMood: "Изменить настроение",
    requestedMoodPlaceholder: "Например, melancholy, spooky",
    vocalStyle: "Стиль вокала (например, female choir, deep voice rap)",
    vocalStylePlaceholder: "Переопределить стиль вокала в финальном промпте",
    submitButton: "Создать ремейк песни",
    submitButtonLoading: "Обработка...",
    errorHeading: "Ошибка декодирования",
    historyTitle: "История конверсий",
    clearAll: "Очистить всё",
    noHistory: "Вы еще не анализировали ни одной песни.",
    waitingTitle: "Ожидание вашей песни...",
    waitingSubtitle: "Введите защищенную авторским правом песню. ИИ разберет ее микроструктуру, вокал, ритм и тему текста в легальный промпт.",
    cardVibeTitle: "100% безопасная атмосфера",
    cardVibeDesc: "Промпт копирует тональность, инструменты и энергию без рисков нарушения прав.",
    cardThemeTitle: "Тема текста и история",
    cardThemeDesc: "ИИ также адаптирует концепцию текста под ремейк - о чем поется и какие метафоры использовать.",
    loaderTitle: "Процесс создания ремейка запущен",
    bentoSpeed: "СКОРОСТЬ",
    bentoKey: "АККОРДЫ И ТОНАЛЬНОСТЬ",
    bentoGenre: "ЖАНР",
    vocalStyleLabel: "Тон вокала (совместим с Suno/Udio)",
    promptLabel: "Оптимизированный музыкальный промпт",
    copyButton: "Скопировать промпт",
    copiedButton: "Скопировано!",
    readyTitle: "Готово к генерации в Suno / Udio",
    readyDesc: "Вставьте скопированный промпт прямо в поле ввода ИИ-генератора музыки.",
    backToIntro: "Назад на главную",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Поддержка",
    terms: "Условия использования",
    privacy: "Cookies и GDPR",
    vibeDecoded: "АУДИО ДНК ДЕКОДИРОВАНО",
    analysisErrorEmpty: "Пожалуйста, введите название песни или исполнителя.",
    lyricsThemeLabel: "Тема текста и эмоции",
    instrumentationLabel: "Инструменты и Сведение",
    dnaDescriptionLabel: "ИИ-Анализ и Remake ДНК"
  },
  es: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Éxitos populares convertidos en prompts de música de IA gratuitos.",
    ctaButton: "Iniciar Consola de Remakes",
    card1Title: "Audio DNA",
    card1Desc: "Creación precisa de remakes para tempo, ritmo, estructura de acordes e instrumentación.",
    card2Title: "Adaptaciones Líricas",
    card2Desc: "Convierte de forma segura el tema, la resonancia emocional y el concepto narrativo.",
    card3Title: "Exportación Directa",
    card3Desc: "Prompts optimizados listos para copiar con un solo clic para los generadores.",
    studioHeading: "Herramienta Remake Studio",
    studioSubheading: "Estación de Trabajo de IA",
    searchLabel: "Buscar canción (o ingresar manualmente)",
    searchPlaceholder: "Comienza a escribir el nombre de la canción o artista...",
    searchLabelTip: "Sugerencias de muestra:",
    randomSample: "Probar un éxito aleatorio",
    creativeTweaks: "Ajustes creativos (Remix Overrides)",
    hide: "Ocultar",
    show: "Mostrar",
    targetGenre: "Género objetivo (p. ej. Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "El género original se reemplazará por este...",
    requestedBpm: "BPM solicitado",
    requestedBpmPlaceholder: "P. ej. 120 o lento",
    requestedMood: "Cambiar estado de ánimo",
    requestedMoodPlaceholder: "P. ej. melancholy, spooky",
    vocalStyle: "Estilo vocal (p. ej. female choir, deep voice rap)",
    vocalStylePlaceholder: "Invalide el tipo de voz en el prompt final",
    submitButton: "Crear Remake de Canción",
    submitButtonLoading: "Procesando...",
    errorHeading: "Error de decodificación",
    historyTitle: "Historial de conversiones",
    clearAll: "Borrar todo",
    noHistory: "Aún no has analizado ninguna canción.",
    waitingTitle: "Esperando tu canción...",
    waitingSubtitle: "Ingresa una canción con copyright. La IA analizará su microestructura, tono vocal, ritmo y temas líricos en un prompt legal.",
    cardVibeTitle: "Vibe 100% de Remake",
    cardVibeDesc: "El prompt replica el tono, instrumentos y energía sin riesgos de derechos de autor.",
    cardThemeTitle: "Temas líricos e historia",
    cardThemeDesc: "La IA también crea un remake para el concepto lírico: de qué trata y qué metáforas utilizar.",
    loaderTitle: "Proceso de creación de remake iniciado",
    bentoSpeed: "VELOCIDAD",
    bentoKey: "ACORDES & TONO",
    bentoGenre: "GÉNERO",
    vocalStyleLabel: "Tono vocal (compatible con Suno/Udio)",
    promptLabel: "Prompt de música optimizado",
    copyButton: "Copiar Prompt",
    copiedButton: "¡Copiado!",
    readyTitle: "Listo para generar en Suno / Udio",
    readyDesc: "Pega el prompt copiado directamente en el campo de entrada principal de tu generador de música IA.",
    backToIntro: "Volver al inicio",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Soporte",
    terms: "Condiciones de uso",
    privacy: "Cookies y GDPR",
    vibeDecoded: "ADN DE AUDIO DECODIFICADO",
    analysisErrorEmpty: "Por favor, ingrese el nombre de la canción o el artista.",
    lyricsThemeLabel: "Tema lírico y emoción",
    instrumentationLabel: "Instrumentación y Producción",
    dnaDescriptionLabel: "Análisis de IA y Remake DNA"
  },
  pt: {
    title: "Say Bye Bye",
    titleStrike: "to Copyright STRIKES!",
    subtitle: "Sucessos populares transformados em prompts de música de IA gratuitos.",
    ctaButton: "Iniciar Console de Remakes",
    card1Title: "Audio DNA",
    card1Desc: "Criação precisa de remakes para o andamento, ritmo, estrutura de acordes e instrumentação.",
    card2Title: "Adaptações Líricas",
    card2Desc: "Converte de forma segura o tema, ressonância emocional e conceito de narrativa.",
    card3Title: "Exportação Direta",
    card3Desc: "Prompts otimizados prontos para copiar com um único clique para os geradores.",
    studioHeading: "Ferramenta Remake Studio",
    studioSubheading: "Estação de Trabalho de IA",
    searchLabel: "Buscar música (ou digitar manualmente)",
    searchPlaceholder: "Comece a digitar o nome da música ou artista...",
    searchLabelTip: "Sugestões de exemplo:",
    randomSample: "Tentar um sucesso aleatório",
    creativeTweaks: "Ajustes criativos (Remix Overrides)",
    hide: "Ocultar",
    show: "Mostrar",
    targetGenre: "Gênero alvo (ex: Synthwave, Lofi acoustic)",
    targetGenrePlaceholder: "O gênero original será substituído por este...",
    requestedBpm: "BPM solicitado",
    requestedBpmPlaceholder: "Ex: 120 ou slow",
    requestedMood: "Alterar humor",
    requestedMoodPlaceholder: "Ex: melancholy, spooky",
    vocalStyle: "Estilo vocal (ex: female choir, deep voice rap)",
    vocalStylePlaceholder: "Substitua o tipo vocal no prompt final",
    submitButton: "Criar Remake de Música",
    submitButtonLoading: "Processando...",
    errorHeading: "Erro ao decodificar",
    historyTitle: "Histórico de conversões",
    clearAll: "Apagar tudo",
    noHistory: "Nenhuma música analisada ainda.",
    waitingTitle: "Aguardando sua música...",
    waitingSubtitle: "Insira uma música protegida. A IA analisará sua microestrutura, tom de voz, ritmo e temas líricos em um prompt legal.",
    cardVibeTitle: "Vibe 100% Remake",
    cardVibeDesc: "O prompt replica o tom, instrumentos e energia sem riscos de direitos autorais.",
    cardThemeTitle: "Temas líricos & história",
    cardThemeDesc: "A IA também cria um remake para o conceito lírico: sobre o que canta e quais metáforas usar.",
    loaderTitle: "Processo de criação de remake iniciado",
    bentoSpeed: "VELOCIDADE",
    bentoKey: "ACORDES & TOM",
    bentoGenre: "GÊNERO",
    vocalStyleLabel: "Tom vocal (compatível com Suno/Udio)",
    promptLabel: "Prompt de música optimizado",
    copyButton: "Copiar Prompt",
    copiedButton: "Copiado!",
    readyTitle: "Pronto para gerar no Suno / Udio",
    readyDesc: "Cole o prompt copiado diretamente no campo de entrada principal do seu gerador de música de IA.",
    backToIntro: "Voltar ao início",
    footerText: "© 2026 ByeByeStrike AI",
    support: "Suporte",
    terms: "Termos de Uso",
    privacy: "Cookies e GDPR",
    vibeDecoded: "ADN DE ÁUDIO DECODIFICADO",
    analysisErrorEmpty: "Por favor, digite o nome da música ou artista.",
    lyricsThemeLabel: "Tema lírico & emoção",
    instrumentationLabel: "Instrumentação & Produção",
    dnaDescriptionLabel: "Análise de IA & Remake DNA"
  }
};

const EXAMPLE_SONGS = [
  "Daft Punk - Get Lucky",
  "The Weeknd - Blinding Lights",
  "Billie Eilish - Bad Guy",
  "Michael Jackson - Billie Jean",
  "Nirvana - Smells Like Teen Spirit"
];

export default function App() {
  const [lang, setLang] = useState<string>(() => {
    // Try to auto-detect browser language or default to 'cs'
    const browserLang = navigator.language?.split("-")[0];
    const supported = ["en", "cs", "sk", "pl", "de", "ru", "es", "pt"];
    if (supported.includes(browserLang)) return browserLang;
    return "cs";
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<iTunesTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<iTunesTrack | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Rotating step index
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Custom remix overrides
  const [showTweaks, setShowTweaks] = useState(false);
  const [customGenre, setCustomGenre] = useState("");
  const [customBpm, setCustomBpm] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [customVocals, setCustomVocals] = useState("");

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Check cookie consent on mount
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsentAccepted");
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  // Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTermsModal(false);
        setShowSupportModal(false);
        setShowPrivacyModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  const welcomeRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [activeSection, setActiveSection] = useState(0); // 0 = Welcome, 1 = Studio Console
  const isTransitioningRef = useRef(false);

  const currentLoadingSteps = LOADING_STEPS[lang] || LOADING_STEPS.cs;

  const scrollToStudio = () => {
    setActiveSection(1);
    if (studioRef.current) {
      studioRef.current.scrollTop = 0;
    }
  };

  const scrollToTop = () => {
    setActiveSection(0);
  };

  // Advanced aesthetic single-scroll hijack engine
  useEffect(() => {
    const isInsideScrollable = (el: HTMLElement | null): boolean => {
      if (!el || el === document.body) return false;
      if (el === studioRef.current || el === welcomeRef.current) return false;
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isScrollable = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight;
      if (isScrollable) {
        return true;
      }
      return isInsideScrollable(el.parentElement);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      if (isInsideScrollable(e.target as HTMLElement)) {
        return;
      }

      // Scrolling Down -> Go to Studio Console
      if (e.deltaY > 15 && activeSection === 0) {
        e.preventDefault();
        isTransitioningRef.current = true;
        scrollToStudio();
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 1100);
      }
      
      // Scrolling Up -> Go to Welcome Screen
      if (e.deltaY < -15 && activeSection === 1) {
        const studioConsole = studioRef.current;
        // Relaxed scroll-up detection threshold (scrollTop <= 20)
        if (studioConsole && studioConsole.scrollTop <= 20) {
          e.preventDefault();
          isTransitioningRef.current = true;
          scrollToTop();
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 1100);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      if (isInsideScrollable(e.target as HTMLElement)) {
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY - touchEndY;

      // Swiped Up / Scrolling Down -> Go to Studio Console
      if (diffY > 40 && activeSection === 0) {
        isTransitioningRef.current = true;
        scrollToStudio();
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 1100);
      }

      // Swiped Down / Scrolling Up -> Go to Welcome Screen
      if (diffY < -40 && activeSection === 1) {
        const studioConsole = studioRef.current;
        if (studioConsole && studioConsole.scrollTop <= 20) {
          isTransitioningRef.current = true;
          scrollToTop();
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 1100);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeSection]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("byebyestrike_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: AnalysisResult[]) => {
    setHistory(newHistory);
    localStorage.setItem("byebyestrike_history", JSON.stringify(newHistory));
  };

  // Close suggestions and language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Suggestions from Express iTunes Proxy
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?term=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const tracks = (data.results || []).map((track: any) => ({
          trackId: track.trackId,
          trackName: track.trackName,
          artistName: track.artistName,
          artworkUrl100: track.artworkUrl100,
          primaryGenreName: track.primaryGenreName
        }));
        setSuggestions(tracks);
      }
    } catch (err) {
      console.error("Suggestions fetch error:", err);
    }
  };

  // Handle Input Changes with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedTrack(null); // Clear selected track if user edits input manually

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
      setShowSuggestions(true);
    }, 400);
  };

  // Handle selecting a track from dropdown
  const selectTrack = (track: iTunesTrack) => {
    setSearchQuery(`${track.artistName} - ${track.trackName}`);
    setSelectedTrack(track);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Select a random sample song
  const handleRandomSample = () => {
    const rand = EXAMPLE_SONGS[Math.floor(Math.random() * EXAMPLE_SONGS.length)];
    setSearchQuery(rand);
    setSelectedTrack(null);
  };

  // Handle analysis
  const handleDeCopyright = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setError(t.analysisErrorEmpty);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Rotate through loading messages
    let step = 0;
    setLoadingStepIndex(0);
    const interval = setInterval(() => {
      step = (step + 1) % currentLoadingSteps.length;
      setLoadingStepIndex(step);
    }, 1800);

    // Smoothly increment progress without getting stuck
    let progress = 0;
    setLoadingProgress(0);
    const progressInterval = setInterval(() => {
      let increment = 0;
      if (progress < 40) {
        increment = Math.random() * 3 + 2; // Fast start
      } else if (progress < 70) {
        increment = Math.random() * 1.5 + 0.8; // Steady middle
      } else if (progress < 90) {
        increment = Math.random() * 0.6 + 0.3; // Slower approach
      } else {
        increment = Math.random() * 0.12 + 0.04; // Extremely tiny but continuous increments so it never gets stuck!
      }
      progress = Math.min(99, progress + increment);
      setLoadingProgress(Math.floor(progress));
    }, 150);

    try {
      const response = await fetch("/api/decopyright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: searchQuery,
          customGenre: showTweaks ? customGenre : undefined,
          customBpm: showTweaks ? customBpm : undefined,
          customMood: showTweaks ? customMood : undefined,
          customVocals: showTweaks ? customVocals : undefined,
          lang: lang
        })
      });

      clearInterval(interval);
      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.errorHeading);
      }

      const data = await response.json();
      
      const hasCustomTweaks = showTweaks && (customGenre.trim() || customBpm.trim() || customMood.trim() || customVocals.trim());
      const remixParts: string[] = [];
      if (showTweaks) {
        if (customMood.trim()) remixParts.push(customMood.trim());
        if (customBpm.trim()) {
          const bpmVal = customBpm.trim();
          remixParts.push(bpmVal.toLowerCase().includes("bpm") ? bpmVal : `${bpmVal}bpm`);
        }
        if (customGenre.trim()) remixParts.push(customGenre.trim());
        if (customVocals.trim()) remixParts.push(customVocals.trim());
      }
      const remixDetailsStr = remixParts.join(", ");
      
      const newResult: AnalysisResult = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        artworkUrl: selectedTrack?.artworkUrl100,
        timestamp: new Date().toLocaleTimeString(lang === "cs" ? "cs-CZ" : "en-US", { hour: "2-digit", minute: "2-digit" }),
        is_remix: !!hasCustomTweaks,
        remix_details: hasCustomTweaks ? remixDetailsStr : undefined
      };

      // Add a tiny delay to let user see 100% completion
      await new Promise(resolve => setTimeout(resolve, 150));

      setAnalysisResult(newResult);
      saveHistory([newResult, ...history.slice(0, 9)]); // Keep last 10 entries
    } catch (err: any) {
      clearInterval(interval);
      clearInterval(progressInterval);
      console.error("De-copyright error:", err);
      setError(err.message || "Error communicating with the workstation server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load from history
  const loadFromHistory = (item: AnalysisResult) => {
    setAnalysisResult(item);
    setSearchQuery(item.original_song);
    if (item.artworkUrl) {
      setSelectedTrack({
        trackId: -1,
        trackName: item.original_song.split(" - ")[1] || item.original_song,
        artistName: item.original_song.split(" - ")[0] || "",
        artworkUrl100: item.artworkUrl
      });
    } else {
      setSelectedTrack(null);
    }
  };

  // Delete single history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  // Clear all history
  const clearAllHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-200 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Global Persistent Header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-10 z-50 border-b border-slate-900/60 bg-slate-950/85 backdrop-blur-md">
        <div onClick={scrollToTop} className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="w-10 h-10 vibrant-gradient rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ByeByeStrike <span className="text-rose-500">AI</span>
          </h1>
        </div>



        <div className="flex items-center gap-3">
          {/* Mobile indicator / Quick Link Button */}
          <button
            onClick={activeSection === 0 ? scrollToStudio : scrollToTop}
            className="sm:hidden flex items-center justify-center bg-slate-900/80 border border-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-full text-xs cursor-pointer hover:bg-slate-800 hover:text-white transition-all"
          >
            {activeSection === 0 ? (NAV_LABELS[lang]?.console || NAV_LABELS.en.console) : (NAV_LABELS[lang]?.welcome || NAV_LABELS.en.welcome)}
          </button>

          {/* Language Switcher Dropdown */}
          <div 
            ref={langDropdownRef}
            className="relative z-50"
          >
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium transition-all cursor-pointer"
            >
              <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
              <span className="hidden md:inline">{LANGUAGES.find(l => l.code === lang)?.name}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-1.5 w-36 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl p-1 z-50 divide-y divide-slate-900/50"
                >
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setError(null);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        lang === l.code ? "bg-rose-500/10 text-rose-400 font-semibold" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Sliding Wrapper */}
      <div 
        className="w-full h-full flex flex-col transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0" 
        style={{ transform: `translateY(-${activeSection * 100}%)` }}
      >

        {/* Screen 1: Welcome Hero */}
        <div ref={welcomeRef} className="w-full h-screen shrink-0 flex flex-col justify-between relative z-10 overflow-y-auto lg:overflow-hidden pt-20">
          
          {/* Welcome Landing Section */}
          <section className="flex-1 flex flex-col justify-center pt-6 md:pt-12 pb-12 items-center text-center px-6 py-6 relative z-10 max-w-5xl mx-auto w-full">
            
            {/* Main Huge Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="-mt-10 md:-mt-20 text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight font-display tracking-tight"
            >
              {t.title} <br />
              <span className="text-rose-500">{t.titleStrike}</span>
            </motion.h2>

            {/* Supporting Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-slate-300 text-xl md:text-3xl font-medium max-w-3xl mb-12 leading-relaxed"
            >
              {t.subtitle}
            </motion.p>

            {/* Core Capabilities Teaser Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
            >
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-400">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5 font-display">{t.card1Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.card1Desc}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5 font-display">{t.card2Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.card2Desc}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5 font-display">{t.card3Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.card3Desc}</p>
              </div>
            </motion.div>

            {/* Action CTA Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col items-center gap-4 mt-12 md:mt-16"
            >
              <button
                onClick={scrollToStudio}
                className="vibrant-gradient text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <span>{t.ctaButton}</span>
              </button>

              {/* Scroll Down Indicator Circle */}
              <button
                onClick={scrollToStudio}
                aria-label="Scroll down"
                className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950/40 hover:border-rose-500/50 hover:bg-rose-500/10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
              >
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-rose-400 animate-bounce" />
              </button>
            </motion.div>
          </section>
        </div>

        {/* Screen 2: Content Container */}
        <main ref={studioRef} id="studio-console" className="w-full h-screen shrink-0 p-4 md:p-6 pt-28 md:pt-32 flex flex-col gap-4 z-10 justify-start max-w-7xl mx-auto relative overflow-y-auto">
          
          {/* 16:9 Studio Console Container */}
          <div className="w-full lg:aspect-[16/9] lg:min-h-[660px] bg-slate-950/60 border border-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-900 backdrop-blur-xl">
            
            {/* Left Column: Inputs and Controls */}
            <div className="w-full lg:w-[40%] flex flex-col p-5 md:p-6 overflow-hidden space-y-5">
              
              <div className="glass-interactive p-5 rounded-2xl">
                <h2 className="text-xs font-display font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Music className="w-4 h-4 text-rose-500" />
                  {t.searchLabel}
                </h2>

                <form onSubmit={handleDeCopyright} className="space-y-4">
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      disabled={isLoading}
                      value={searchQuery}
                      onChange={handleInputChange}
                      placeholder={t.searchPlaceholder}
                      className={`w-full text-slate-100 border rounded-xl py-2.5 pl-10 pr-36 text-xs placeholder:text-slate-500 focus:border-rose-500 focus:outline-none transition-all ${
                        isLoading 
                          ? "bg-slate-950 text-slate-500 border-slate-900/80 cursor-not-allowed opacity-50" 
                          : "bg-slate-900 border-slate-800"
                      }`}
                    />

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleRandomSample}
                      className={`absolute right-2 px-2.5 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 transition-all border ${
                        isLoading 
                          ? "text-slate-500 bg-slate-900/40 border-slate-900/60 cursor-not-allowed opacity-40" 
                          : "text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/10 hover:border-rose-500/30 cursor-pointer"
                      }`}
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>{t.randomSample}</span>
                    </button>

                    {/* Suggestions list */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          ref={suggestionsRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 right-0 mt-12 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-900"
                        >
                          {suggestions.map((track) => (
                            <div
                              key={track.trackId}
                              onClick={() => selectTrack(track)}
                              className="p-2.5 hover:bg-slate-900/60 transition-colors flex items-center gap-3 cursor-pointer text-left"
                            >
                              {track.artworkUrl100 && (
                                <img
                                  src={track.artworkUrl100}
                                  alt=""
                                  className="w-8 h-8 rounded-md object-cover border border-slate-900"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-200 truncate font-semibold">{track.trackName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{track.artistName}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Collapsible Remix Tweaks */}
                  <div className={`border rounded-xl overflow-hidden bg-slate-950/40 ${isLoading ? "border-slate-950 opacity-50" : "border-slate-900"}`}>
                    <button
                      type="button"
                      disabled={isLoading}
                      id="tweaks-toggle-btn"
                      onClick={() => !isLoading && setShowTweaks(!showTweaks)}
                      className={`w-full flex items-center justify-between p-2.5 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                        isLoading 
                          ? "text-slate-500 cursor-not-allowed bg-slate-950/20" 
                          : "text-slate-300 hover:bg-slate-900/30 cursor-pointer"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <SlidersHorizontal className={`w-3.5 h-3.5 ${isLoading ? "text-slate-600" : "text-rose-500"}`} />
                        {t.creativeTweaks}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[9px] font-bold">{showTweaks ? t.hide : t.show}</span>
                        {/* Custom Toggle Switch resembling the user's image in theme colors */}
                        <div 
                          className={`w-14 h-8 rounded-full p-0.5 transition-all duration-300 relative flex items-center shadow-inner ${
                            isLoading 
                              ? "bg-slate-900 border border-slate-950 opacity-40 cursor-not-allowed"
                              : showTweaks 
                                ? "bg-rose-500 shadow-rose-500/20 cursor-pointer" 
                                : "bg-slate-800 border border-slate-700/60 cursor-pointer"
                          }`}
                        >
                          {/* Switch Knob */}
                          <motion.div 
                            layout
                            className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                              marginLeft: showTweaks ? "auto" : "0px",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                            }}
                          />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {showTweaks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="p-3.5 border-t border-slate-900 space-y-2.5 bg-slate-900/20"
                        >
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 mb-0.5">{t.targetGenre}</label>
                            <input
                              type="text"
                              disabled={isLoading}
                              value={customGenre}
                              onChange={(e) => setCustomGenre(e.target.value)}
                              placeholder={t.targetGenrePlaceholder}
                              className={`w-full border rounded-lg p-2 text-[10px] focus:border-rose-500 focus:outline-none transition-all ${
                                isLoading 
                                  ? "bg-slate-950 text-slate-500 border-slate-900/60 cursor-not-allowed opacity-50" 
                                  : "bg-slate-900 text-slate-200 border-slate-800"
                              }`}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 mb-0.5">{t.requestedBpm}</label>
                              <input
                                type="text"
                                disabled={isLoading}
                                value={customBpm}
                                onChange={(e) => setCustomBpm(e.target.value)}
                                placeholder={t.requestedBpmPlaceholder}
                                className={`w-full border rounded-lg p-2 text-[10px] focus:border-rose-500 focus:outline-none transition-all ${
                                  isLoading 
                                    ? "bg-slate-950 text-slate-500 border-slate-900/60 cursor-not-allowed opacity-50" 
                                    : "bg-slate-900 text-slate-200 border-slate-800"
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 mb-0.5">{t.requestedMood}</label>
                              <input
                                type="text"
                                disabled={isLoading}
                                value={customMood}
                                onChange={(e) => setCustomMood(e.target.value)}
                                placeholder={t.requestedMoodPlaceholder}
                                className={`w-full border rounded-lg p-2 text-[10px] focus:border-rose-500 focus:outline-none transition-all ${
                                  isLoading 
                                    ? "bg-slate-950 text-slate-500 border-slate-900/60 cursor-not-allowed opacity-50" 
                                    : "bg-slate-900 text-slate-200 border-slate-800"
                                }`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 mb-0.5">{t.vocalStyle}</label>
                            <input
                              type="text"
                              disabled={isLoading}
                              value={customVocals}
                              onChange={(e) => setCustomVocals(e.target.value)}
                              placeholder={t.vocalStylePlaceholder}
                              className={`w-full border rounded-lg p-2 text-[10px] focus:border-rose-500 focus:outline-none transition-all ${
                                isLoading 
                                  ? "bg-slate-950 text-slate-500 border-slate-900/60 cursor-not-allowed opacity-50" 
                                  : "bg-slate-900 text-slate-200 border-slate-800"
                              }`}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-bold h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs ${
                      isLoading 
                        ? "bg-slate-900 border border-slate-800 text-slate-500 shadow-none cursor-not-allowed" 
                        : "vibrant-gradient text-white shadow-rose-500/10 hover:scale-101 active:scale-99 cursor-pointer"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-rose-200" />
                        <span>{t.submitButtonLoading}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-rose-200" />
                        <span>{t.submitButton}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-[10px] text-rose-300">
                        <p className="font-semibold mb-0.5">{t.errorHeading}</p>
                        <p>{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* History Panel */}
              <div className="glass-interactive p-5 rounded-2xl flex-1 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <History className="w-4 h-4 text-indigo-400" />
                    {t.historyTitle}
                  </h3>
                  {history.length > 0 && (
                    <button
                      disabled={isLoading}
                      onClick={clearAllHistory}
                      className={`transition-colors text-xs flex items-center gap-1 font-bold ${
                        isLoading 
                          ? "text-slate-600 cursor-not-allowed opacity-40" 
                          : "text-slate-500 hover:text-rose-400 cursor-pointer"
                      }`}
                      title={t.clearAll}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.clearAll}
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                    <Disc className="w-8 h-8 text-slate-700 animate-spin-slow mb-2" />
                    <p className="text-xs text-slate-400">{t.noHistory}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[160px] pr-1">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => !isLoading && loadFromHistory(item)}
                        className={`p-2 border rounded-lg transition-all flex items-center gap-2.5 group ${
                          isLoading 
                            ? "bg-slate-950/25 border-slate-950/50 cursor-not-allowed opacity-40" 
                            : "bg-slate-900/30 hover:bg-slate-850/50 border-slate-900/50 hover:border-slate-800/50 cursor-pointer"
                        }`}
                      >
                        {item.artworkUrl ? (
                          <img 
                            src={item.artworkUrl} 
                            alt="" 
                            className="w-8 h-8 rounded-md object-cover border border-slate-900 group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-850 rounded-md flex items-center justify-center">
                            <Music className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-rose-400 transition-colors flex items-center gap-1">
                            <span className="truncate">{item.original_song}</span>
                            {item.is_remix && (
                              <span className="text-[9px] text-rose-400 font-mono shrink-0 font-normal">
                                (remix)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] bg-slate-800/80 text-slate-300 py-0.5 px-1 rounded font-mono">
                              {(item.genre || "Unknown").split(",")[0]}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-1 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Smazat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Dynamic Loader & DNA Output Results */}
            <div className="w-full lg:w-[60%] flex flex-col p-5 md:p-6 lg:overflow-y-auto bg-slate-950/20 relative justify-between scrollbar-thin">
              
              <AnimatePresence mode="wait">
                
                {/* 1. INITIAL EMPTY STATE */}
                {!isLoading && !analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-900 rounded-2xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 shadow-xl relative animate-pulse">
                      <span className="text-2xl relative z-10">🎸</span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-white mb-5">{t.waitingTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full">
                      <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left">
                        <span className="text-rose-400 font-mono text-[9px] font-bold block">{t.cardVibeTitle}</span>
                      </div>
                      <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-left">
                        <span className="text-indigo-400 font-mono text-[9px] font-bold block">{t.cardThemeTitle}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. LOADING STATE */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="relative w-16 h-16 mb-5">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full border-4 border-indigo-500/20 border-b-transparent animate-spin-reverse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Disc className="w-6 h-6 text-rose-500 animate-pulse" />
                      </div>
                    </div>
                    
                    <h3 className="font-display font-semibold text-xs text-rose-400 mb-1">
                      {t.loaderTitle}
                    </h3>
                    
                    <div className="h-6 overflow-hidden max-w-xs w-full relative mb-4">
                      <AnimatePresence mode="popLayout">
                        <motion.p
                          key={loadingStepIndex}
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -15, opacity: 0 }}
                          className="text-[10px] font-mono text-slate-300 truncate text-center"
                        >
                          {currentLoadingSteps[loadingStepIndex]}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Progress Percentage Display */}
                    <div className="text-xl font-bold font-mono text-white mb-2.5">
                      {loadingProgress}%
                    </div>

                    <div className="max-w-[200px] w-full bg-slate-900 border border-slate-800/80 h-2 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        className="h-full rounded-full vibrant-gradient"
                        initial={{ width: "0%" }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ ease: "easeOut", duration: 0.15 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* 3. DYNAMIC DNA RESULTS DISPLAY */}
                {analysisResult && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full flex flex-col space-y-3.5"
                  >
                    {/* Header of analysis card */}
                    <div className="flex items-start gap-3 pb-3 border-b border-white/5">
                      {analysisResult.artworkUrl ? (
                        <img 
                          src={analysisResult.artworkUrl} 
                          alt="" 
                          className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow-lg shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-rose-500/20 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                          <Music className="w-5 h-5 text-rose-500" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest font-bold">{t.vibeDecoded}</span>
                        <h3 className="font-display font-extrabold text-sm text-white flex flex-wrap items-center gap-x-2 mt-0.5" title={analysisResult.original_song}>
                          <span className="truncate max-w-[260px] sm:max-w-[320px] md:max-w-md block">{analysisResult.original_song}</span>
                          {analysisResult.is_remix && analysisResult.remix_details && (
                            <span className="text-[10px] font-normal text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 shadow-sm shrink-0">
                              remix: {analysisResult.remix_details}
                            </span>
                          )}
                        </h3>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <span>Tempo:</span>
                          <span className="text-slate-200 font-semibold">{analysisResult.bpm} BPM</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-ping" style={{ animationDuration: `${60 / analysisResult.bpm}s` }} />
                        </p>
                      </div>
                    </div>

                    {/* Bento Grid: Audio Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-white/3 border border-white/5 rounded-xl text-center flex flex-col justify-between min-h-[58px]">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wide">{t.bentoSpeed}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-900 border border-slate-800 text-slate-200 font-bold mt-1 inline-block w-fit mx-auto">
                          {analysisResult.bpm} BPM
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/3 border border-white/5 rounded-xl text-center flex flex-col justify-between min-h-[58px]">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wide">{t.bentoKey}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-900 border border-slate-800 text-slate-200 font-bold mt-1 inline-block w-fit mx-auto">
                          {analysisResult.musical_key || "N/A"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white/3 border border-white/5 rounded-xl text-center flex flex-col justify-between min-h-[58px]">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wide">{t.bentoGenre}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-200 font-bold mt-1 inline-block truncate max-w-full w-fit mx-auto" title={analysisResult.genre}>
                          {(analysisResult.genre || "N/A").split(",")[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Vocal Style Specification */}
                    <div className="p-3.5 bg-white/3 border border-white/5 rounded-xl text-left">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold tracking-wide">{t.vocalStyleLabel}</span>
                      <p className="text-sm text-slate-200 italic font-sans">
                        "{analysisResult.vocal_style}"
                      </p>
                    </div>

                    {/* Generated Prompt Output Block */}
                    <div className="flex flex-col space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          MUSIC PROMPT
                        </span>
                        <button
                          onClick={() => handleCopy(analysisResult.ai_music_prompt)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 py-1 px-2.5 rounded-lg hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer font-bold"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">{t.copiedButton}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{t.copyButton}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code-like presentation */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-indigo-500/5 rounded-xl pointer-events-none" />
                        <pre className="p-4 bg-black/40 border border-white/5 rounded-xl text-blue-300 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words max-h-[550px] overflow-y-auto select-all shadow-inner">
                          "{analysisResult.ai_music_prompt}"
                        </pre>
                      </div>
                    </div>

                    {/* Suno / Udio generation instructions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-white/5 gap-3">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-200">{t.readyTitle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.readyDesc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <a
                          href="https://suno.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 py-1.5 px-3 rounded transition-colors flex items-center gap-0.5 shrink-0"
                        >
                          Suno
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <a
                          href="https://udio.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 py-1.5 px-3 rounded transition-colors flex items-center gap-0.5 shrink-0"
                        >
                          Udio
                          <ExternalLink className="w-3 h-3 text-rose-300" />
                        </a>
                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>

          {/* Footer inside the scrollable workspace */}
          <footer className="border-t border-slate-900/60 py-6 px-6 text-center text-xs text-slate-400 mt-auto pt-8 pb-4 shrink-0">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>{t.footerText}</p>
              <div className="flex items-center space-x-4">
                <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={() => setShowSupportModal(true)}>{t.support}</span>
                <span>•</span>
                <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={() => setShowTermsModal(true)}>{t.terms}</span>
                <span>•</span>
                <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={() => setShowPrivacyModal(true)}>{t.privacy}</span>
              </div>
            </div>
          </footer>

        </main>

      </div> {/* End of Sliding Wrapper */}

      {/* Terms of Use Modal Overlay */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-[100]"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg vibrant-gradient flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-mono bg-slate-800 hover:bg-slate-700 py-1 px-2.5 rounded-lg"
                >
                  ESC
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-left">
                {/* Section 1: Disclaimer */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-rose-400 uppercase tracking-wider font-bold">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).disclaimerTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).disclaimerText}
                  </p>
                </div>

                {/* Section 2: Service Definition */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-indigo-400 uppercase tracking-wider font-bold">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).definitionTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).definitionText}
                  </p>
                </div>

                {/* Section 3: User Responsibility */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider font-bold">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).responsibilityTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).responsibilityText}
                  </p>
                </div>

                {/* Section 4: Fair Use */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-amber-400 uppercase tracking-wider font-bold">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).fairUseTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                    {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).fairUseText}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="vibrant-gradient hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                >
                  {(TERMS_CONTENT[lang] || TERMS_CONTENT.cs).close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support & DMCA Modal Overlay */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-[100]"
            onClick={() => setShowSupportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg vibrant-gradient flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-mono bg-slate-800 hover:bg-slate-700 py-1 px-2.5 rounded-lg"
                >
                  ESC
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-left">
                {/* Section 1: Customer Support */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-indigo-400 uppercase tracking-wider font-bold">
                    {(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).needHelpTitle}
                  </h4>
                  <div className="text-sm text-slate-300 leading-relaxed bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                    <p>{(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).needHelpText}</p>
                  </div>
                </div>

                {/* Section 2: Copyright & DMCA */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-rose-400 uppercase tracking-wider font-bold">
                    {(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).copyrightTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    {(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).copyrightText}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="vibrant-gradient hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                >
                  {(SUPPORT_CONTENT[lang] || SUPPORT_CONTENT.cs).close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookies & Privacy (GDPR) Modal Overlay */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-[100]"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg vibrant-gradient flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-mono bg-slate-800 hover:bg-slate-700 py-1 px-2.5 rounded-lg"
                >
                  ESC
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-left">
                {/* Section 1: Cookies */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-indigo-400 uppercase tracking-wider font-bold">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).cookiesTitle}
                  </h4>
                  <div className="text-sm text-slate-300 leading-relaxed bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                    <p>{(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).cookiesText}</p>
                  </div>
                </div>

                {/* Section 2: GDPR */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider font-bold">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).gdprTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).gdprText}
                  </p>
                </div>

                {/* Section 3: Rights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-mono text-rose-400 uppercase tracking-wider font-bold">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).rightsTitle}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).rightsText}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="vibrant-gradient hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                >
                  {(PRIVACY_CONTENT[lang] || PRIVACY_CONTENT.cs).close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Bottom Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <div className="fixed bottom-0 inset-x-0 p-4 md:p-6 z-[150] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto"
            >
              {/* Text & Icon Side */}
              <div className="flex items-start md:items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl vibrant-gradient flex items-center justify-center shrink-0 hidden sm:flex">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-display font-bold text-white leading-tight">
                      {(COOKIE_CONSENT_TRANSLATIONS[lang] || COOKIE_CONSENT_TRANSLATIONS.cs).title}
                    </h3>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold tracking-wider uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded">GDPR</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {(COOKIE_CONSENT_TRANSLATIONS[lang] || COOKIE_CONSENT_TRANSLATIONS.cs).text}
                    {" "}
                    <button
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline cursor-pointer font-mono font-bold ml-1 inline-block"
                    >
                      {(COOKIE_CONSENT_TRANSLATIONS[lang] || COOKIE_CONSENT_TRANSLATIONS.cs).privacyLink} →
                    </button>
                  </p>
                </div>
              </div>

              {/* Action Buttons Side */}
              <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem("cookieConsentAccepted", "essential");
                    setShowCookieBanner(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer hover:scale-[1.01] active:scale-95 text-center whitespace-nowrap"
                >
                  {(COOKIE_CONSENT_TRANSLATIONS[lang] || COOKIE_CONSENT_TRANSLATIONS.cs).decline}
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("cookieConsentAccepted", "all");
                    setShowCookieBanner(false);
                  }}
                  className="vibrant-gradient hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-2 px-5 rounded-full shadow-lg shadow-indigo-500/20 transition-all cursor-pointer text-center whitespace-nowrap"
                >
                  {(COOKIE_CONSENT_TRANSLATIONS[lang] || COOKIE_CONSENT_TRANSLATIONS.cs).accept}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
