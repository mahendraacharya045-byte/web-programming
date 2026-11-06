/* BiHE.COM interactions: sample data, UI behavior, validation, and animations. */

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const toast = (message) => {
      const el = $('#toast'); el.textContent = message; el.classList.add('show');
      clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2700);
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------
       Theme, responsive navigation and CTAs
       ------------------------------------ */
    const themeToggle = $('#themeToggle');
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      themeToggle.textContent = dark ? '☀' : '☾';
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      try { localStorage.setItem('bihe-theme', dark ? 'dark' : 'light'); } catch (_) {}
    });
    try {
      if (localStorage.getItem('bihe-theme') === 'dark') {
        document.body.classList.add('dark'); themeToggle.textContent = '☀'; themeToggle.setAttribute('aria-label', 'Switch to light mode');
      }
    } catch (_) {}
    const menuToggle = $('#menuToggle'), navLinks = $('#navLinks');
    menuToggle.addEventListener('click', () => {
      const opened = navLinks.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(opened)); menuToggle.textContent = opened ? '×' : '☰';
    });
    $$('#navLinks a').forEach(link => link.addEventListener('click', () => { navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰'; }));
    const goSignup = () => $('#signup').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    $('#joinNav').addEventListener('click', goSignup);

    /* -------------------------------------
       Parents' Mode — switch the site's copy
       ------------------------------------- */
    $('#parentsToggle').addEventListener('change', (event) => {
      const enabled = event.target.checked;
      $$('[data-regular][data-parent]').forEach(el => {
        // These copy strings are plain text on purpose, so mode switching is safe.
        el.innerHTML = enabled ? el.dataset.parent : el.dataset.regular;
      });
      $('#parentsState').textContent = enabled ? 'ON' : 'OFF';
      toast(enabled ? 'Parents’ Mode activated. Salary questions incoming. 👀' : 'You are back in your main-character era. ✨');
    });

    /* -------------------------
       Animated live counter stats
       ------------------------- */
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = '1';
        const target = Number(entry.target.dataset.target), duration = 1550, start = performance.now();
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          entry.target.textContent = Math.floor(target * eased).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .5 });
    $$('.count-up').forEach(el => counterObserver.observe(el));

    /* ------------------------------
       Search filters against sample data
       ------------------------------ */
    const profiles = [
      { id: 1, name: 'Aarav', age: 27, gender: 'Man', religion: 'Hindu', city: 'Seoul', bio: 'Can cook biryani. Cannot find socks. Will absolutely send you sunset pics.', tags: ['Biryani enthusiast', 'Dog person', 'Verified'], art: 'linear-gradient(145deg,#f2c9ad,#df9b8e 50%,#8b4961)', emoji: '🌅', verified: true, match: true },
      { id: 2, name: 'Mina', age: 25, gender: 'Woman', religion: 'Buddhist', city: 'Busan', bio: 'Soft heart, strong opinions about iced coffee. Looking for my plus-one to every food market.', tags: ['Cafe hopping', 'Kind chaos', 'Verified'], art: 'linear-gradient(145deg,#f8d8c8,#d9859c 55%,#703d5b)', emoji: '🧋', verified: true, match: false },
      { id: 3, name: 'Daniel', age: 30, gender: 'Man', religion: 'Christian', city: 'Incheon', bio: 'Will assemble your IKEA furniture and only complain a little. Big on loyalty, bigger on naps.', tags: ['DIY guy', 'Plant dad', 'Verified'], art: 'linear-gradient(145deg,#c6d9d0,#81a99e 50%,#355c59)', emoji: '🪴', verified: true, match: false },
      { id: 4, name: 'Priya', age: 26, gender: 'Woman', religion: 'Hindu', city: 'Seoul', bio: 'Fluent in sarcasm and three kinds of dal. My toxic trait is saying “one more episode”.', tags: ['Book lover', 'Home chef', 'Verified'], art: 'linear-gradient(145deg,#f3d4a9,#d78b83 53%,#85455d)', emoji: '📚', verified: true, match: true },
      { id: 5, name: 'Joon', age: 29, gender: 'Man', religion: 'Prefer not to say', city: 'Daegu', bio: 'Gym sometimes, karaoke always. Looking for someone who will let me win at Mario Kart (or humble me).', tags: ['Karaoke king', 'Gym-ish', 'Verified'], art: 'linear-gradient(145deg,#d8d3ef,#a39acb 50%,#514b7b)', emoji: '🎤', verified: true, match: false },
      { id: 6, name: 'Anika', age: 28, gender: 'Woman', religion: 'Muslim', city: 'Daejeon', bio: 'I own 47 plants and have named all of them. Seeking someone who respects the jungle.', tags: ['Plant parent', 'Hiker', 'Verified'], art: 'linear-gradient(145deg,#c8dfbd,#90b98e 50%,#527b64)', emoji: '🌿', verified: true, match: false }
    ];
    let searchedProfiles = [...profiles];
    $('#searchMatches').addEventListener('click', () => {
      const looking = $('#lookingFor').value, [minAge, maxAge] = $('#ageRange').value.split('-').map(Number);
      const religion = $('#religion').value, location = $('#location').value;
      const gender = looking === 'Bride' ? 'Woman' : 'Man';
      searchedProfiles = profiles.filter(p => p.gender === gender && p.age >= minAge && p.age <= maxAge && (religion === 'Any' || p.religion === religion) && (location === 'Any' || p.city === location));
      if (!searchedProfiles.length) {
        $('#searchFeedback').textContent = 'No exact sample match yet. Try widening your filters — your person is not a dropdown. 💗';
        toast('No exact sample matches. Try a wider search!');
      } else {
        $('#searchFeedback').textContent = `${searchedProfiles.length} sample ${searchedProfiles.length === 1 ? 'profile' : 'profiles'} found. Your meet-cute loading...`;
        toast(`${searchedProfiles.length} sample profiles found. Let’s go!`);
      }
      renderDeck(true);
      $('#profiles').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* -------------------------------------
       Swipe-style sample profile card deck
       ------------------------------------- */
    let deckIndex = 0, currentDeck = [...profiles], touchStartX = null;
    const activeProfile = $('#activeProfile');
    function renderDeck(reset = false) {
      if (reset) { currentDeck = [...searchedProfiles]; deckIndex = 0; }
      const p = currentDeck[deckIndex];
      if (!p) {
        activeProfile.innerHTML = `<div style="min-height:440px;display:grid;place-items:center;text-align:center;padding:25px"><div><div style="font-size:3.2rem">🫶</div><h3 style="color:var(--wine);font:700 1.4rem Poppins">You reached the end!</h3><p class="muted" style="font-size:.82rem;line-height:1.6">No more sample profiles in this deck. Real life has more plot twists, promise.</p><button class="btn" id="emptyDeckReset">See them again ↻</button></div></div>`;
        $('#emptyDeckReset').addEventListener('click', () => { currentDeck = [...(searchedProfiles.length ? searchedProfiles : profiles)]; deckIndex = 0; renderDeck(); });
      } else {
        activeProfile.innerHTML = `
          <div class="profile-art" style="background:${p.art}"><span class="art-tag">✦ SAMPLE PROFILE</span><div class="avatar-figure" aria-hidden="true"></div><span class="art-symbol" aria-hidden="true">${p.emoji}</span></div>
          <div class="profile-info"><div class="profile-topline"><div><h3>${p.name}, ${p.age}</h3><div class="profile-meta">${p.city} · ${p.religion}</div></div><span class="verified">✓ Verified</span></div><p class="profile-bio">“${p.bio}”</p><div class="profile-tags">${p.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div>`;
      }
      $('#deckCount').textContent = `PROFILE ${Math.min(deckIndex + 1, currentDeck.length || 0)} OF ${currentDeck.length}`;
      $$('#deckProgress span').forEach((dot, i) => dot.classList.toggle('on', i <= deckIndex && i < 6));
      activeProfile.classList.remove('swipe-left','swipe-right');
    }
    function moveProfile(direction) {
      const p = currentDeck[deckIndex];
      if (!p) return;
      activeProfile.classList.add(direction === 'like' ? 'swipe-right' : 'swipe-left');
      setTimeout(() => {
        if (direction === 'like') {
          if (p.match) showMatch(p.name);
          else toast(`You liked ${p.name}. Manifesting a mutual like. ✨`);
        } else toast(`${p.name} passed with peace and respect. 🕊️`);
        deckIndex++;
        renderDeck();
      }, reduceMotion ? 0 : 280);
    }
    $('#likeProfile').addEventListener('click', () => moveProfile('like'));
    $('#passProfile').addEventListener('click', () => moveProfile('pass'));
    $('#resetDeck').addEventListener('click', () => { currentDeck = [...(searchedProfiles.length ? searchedProfiles : profiles)]; deckIndex = 0; renderDeck(); toast('Fresh deck. Fresh possibilities.'); });
    activeProfile.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    activeProfile.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 65) moveProfile(delta > 0 ? 'like' : 'pass');
      touchStartX = null;
    }, { passive: true });
    renderDeck();

    /* ---------------------------------
       Compatibility calculator (for fun)
       --------------------------------- */
    const loveLines = [
      ['Soulmate-ish behavior.', 'The stars are shipping it. Just remember: communication > telepathy.'],
      ['Elite situationship prevention.', 'Strong potential. You may even agree on what to watch tonight.'],
      ['A certified meet-cute.', 'The vibes are vibing. Please discuss boundaries and pizza toppings.'],
      ['A little chaotic, very cute.', 'You balance each other out. One of you should probably own a calendar.'],
      ['Power couple loading...', 'The algorithm sees teamwork, laughter, and shared charger energy.']
    ];
    $('#compatForm').addEventListener('submit', e => {
      e.preventDefault();
      const a = $('#nameOne').value.trim(), b = $('#nameTwo').value.trim();
      if (!a || !b) return;
      $('#compatResult').classList.remove('show');
      $('#compatLoading').classList.add('show');
      const lines = ['Consulting the stars...', 'Checking if you both hate pineapple on pizza...', 'Asking the moon for a second opinion...', 'Measuring shared blanket potential...'];
      let progress = 0, lineIndex = 0; $('#loadingText').textContent = lines[0]; $('#loadingFill').style.width = '0%';
      const timer = setInterval(() => {
        progress += 25; lineIndex = Math.min(lineIndex + 1, lines.length - 1);
        $('#loadingFill').style.width = `${progress}%`; $('#loadingText').textContent = lines[lineIndex];
        if (progress >= 100) {
          clearInterval(timer); $('#compatLoading').classList.remove('show');
          const seed = [...(a + b)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const score = 68 + (seed % 31), phrase = loveLines[seed % loveLines.length];
          $('#scoreRing').style.setProperty('--score', `${score}%`); $('#scoreValue').textContent = `${score}%`;
          $('#compatVerdict').textContent = phrase[0]; $('#compatMessage').textContent = `${a} + ${b}: ${phrase[1]}`;
          $('#compatResult').classList.add('show');
        }
      }, reduceMotion ? 80 : 520);
    });

    /* ------------------------------
       Five-question spouse personality quiz
       ------------------------------ */
    const quizQuestions = [
      { q: 'It’s 1 a.m. and you hear a noise in the kitchen. You...', options: [
        ['Investigate. The snack drawer has called.','snack'], ['Wake your partner for moral support.','soft'], ['Blame the cat. Even if you do not own one.','chaos'], ['Check the security camera.','planner'] ] },
      { q: 'Your ideal Sunday looks like...', options: [
        ['Brunch, a walk, then a little treat.','soft'], ['A deep clean and colour-coded calendar.','planner'], ['Three meals and five snacks.','snack'], ['A spontaneous road trip. No itinerary.','chaos'] ] },
      { q: 'The TV remote is missing. Your move?', options: [
        ['I know exactly where it is. I am the remote keeper.','planner'], ['Use the phone app and act superior.','chaos'], ['Negotiate for snack-based compensation.','snack'], ['Let my person pick. I just want cozy time.','soft'] ] },
      { q: 'Your love language is basically...', options: [
        ['“I saved you the last dumpling.”','snack'], ['“I made us a shared calendar.”','planner'], ['“I made a playlist for your commute.”','soft'], ['“Pack a bag. We leave in 20.”','chaos'] ] },
      { q: 'A tiny disagreement happens. You...', options: [
        ['Need a snack before this meeting continues.','snack'], ['Want to talk it through and hug after.','soft'], ['Create a fair and balanced pros/cons list.','planner'], ['Make a joke, then circle back properly.','chaos'] ] }
    ];
    const quizResults = {
      snack: { emoji: '🌙', title: 'The Midnight Snacker', text: 'Your love language is sharing the last dumpling. You are loyal, cozy, and mysteriously awake at 2:17 a.m. Your soulmate must respect emergency noodles.' },
      soft: { emoji: '🧸', title: 'The Certified Softie', text: 'You are the human version of a warm blanket. You remember tiny details, send “got home safe?” texts, and give elite hugs. Green flag behaviour.' },
      planner: { emoji: '📋', title: 'The Relationship CEO', text: 'Date night has a calendar invite and a backup venue. You bring stability, snacks, and a suspicious number of spreadsheets. Honestly? Iconic.' },
      chaos: { emoji: '🪩', title: 'The Plot-Twist Romantic', text: 'Life with you is never boring. You are spontaneous, funny, and one “hear me out” away from a new adventure. Your person needs comfy shoes.' }
    };
    let quizIndex = 0, quizAnswers = [], selectedQuizValue = null, lastQuizTitle = '';
    function renderQuiz() {
      const q = quizQuestions[quizIndex]; $('#quizStep').textContent = `QUESTION ${quizIndex + 1} OF ${quizQuestions.length}`;
      $('#quizBar').style.width = `${(quizIndex + 1) / quizQuestions.length * 100}%`; $('#quizQuestion').textContent = q.q;
      $('#quizOptions').innerHTML = q.options.map((opt, i) => `<button type="button" class="quiz-option" data-value="${opt[1]}"><span class="option-letter">${String.fromCharCode(65 + i)}</span>${opt[0]}</button>`).join('');
      selectedQuizValue = null; $('#quizNext').disabled = true; $('#quizNext').textContent = quizIndex === quizQuestions.length - 1 ? 'Reveal my spouse era ✨' : 'Lock it in →';
      $$('.quiz-option').forEach(btn => btn.addEventListener('click', () => {
        $$('.quiz-option').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selectedQuizValue = btn.dataset.value; $('#quizNext').disabled = false;
      }));
    }
    $('#quizNext').addEventListener('click', () => {
      if (!selectedQuizValue) return; quizAnswers.push(selectedQuizValue);
      if (quizIndex < quizQuestions.length - 1) { quizIndex++; renderQuiz(); }
      else {
        const tally = quizAnswers.reduce((acc, val) => (acc[val] = (acc[val] || 0) + 1, acc), {});
        const winner = Object.keys(tally).sort((a,b) => tally[b] - tally[a])[0], result = quizResults[winner];
        $('#quizQuestionArea').style.display = 'none'; $('#quizResult').classList.add('show');
        $('#quizResultEmoji').textContent = result.emoji; $('#quizResultTitle').textContent = result.title; $('#quizResultText').textContent = result.text; lastQuizTitle = result.title;
      }
    });
    $('#retryQuiz').addEventListener('click', () => { quizIndex = 0; quizAnswers = []; $('#quizQuestionArea').style.display = 'block'; $('#quizResult').classList.remove('show'); renderQuiz(); });
    $('#shareQuiz').addEventListener('click', async () => {
      const shareText = `I got “${lastQuizTitle}” on BiHE.COM's spouse quiz. What's your spouse era? 💘`;
      try { if (navigator.share) await navigator.share({ title: 'My BiHE spouse type', text: shareText }); else { await navigator.clipboard.writeText(shareText); toast('Result copied. Go humble-brag in the group chat!'); } }
      catch (_) { toast('Your result: ' + lastQuizTitle + ' 💘'); }
    });
    renderQuiz();

    /* --------------------------
       Dealbreaker bingo selection
       -------------------------- */
    const bingoItems = [
      ['😴','Snores like a tractor'],['🍽️','Chews at 4K volume'],['🪴','Owns 47 plants'],['📱','Replies “k”'],
      ['🧦','Leaves socks everywhere'],['🍍','Puts pineapple on pizza'],['🚗','Never picks the playlist'],['🛏️','Steals 90% of the blanket'],
      ['🧼','Leaves one spoon in the sink'],['🎮','Says “one last game”'],['🕰️','Says 5 mins, means 45'],['📸','Takes 80 food pics'],
      ['🐈','Thinks cats are the boss'],['🧊','Sets AC to arctic'],['🗣️','Talks during movies'],['🛒','Hates grocery shopping']
    ];
    const selectedBingo = new Set();
    $('#bingoGrid').innerHTML = bingoItems.map((item, i) => `<button class="bingo-cell" type="button" data-index="${i}" aria-pressed="false"><span>${item[0]}</span>${item[1]}</button>`).join('');
    function updateBingo() {
      $('#bingoCount').textContent = selectedBingo.size;
      $('#selectedDealbreakers').innerHTML = selectedBingo.size ? [...selectedBingo].map(i => `<span>${bingoItems[i][1]}</span>`).join('') : '<span>Your standards await ✨</span>';
    }
    $$('.bingo-cell').forEach(btn => btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);
      if (selectedBingo.has(index)) selectedBingo.delete(index); else selectedBingo.add(index);
      btn.classList.toggle('checked', selectedBingo.has(index)); btn.setAttribute('aria-pressed', String(selectedBingo.has(index))); updateBingo();
    }));
    $('#clearBingo').addEventListener('click', () => { selectedBingo.clear(); $$('.bingo-cell').forEach(btn => { btn.classList.remove('checked'); btn.setAttribute('aria-pressed','false'); }); updateBingo(); toast('Standards reset. We love a fresh start.'); });

    /* ------------------------------
       Success story carousel controls
       ------------------------------ */
    const stories = [
      { quote: 'We argued about the thermostat on our first date. Five years later, still arguing. Married.', names: 'Maya & Rohan · Matched in 2021', avatars: ['👩🏻','👨🏽'] },
      { quote: 'She said she loved hiking. Turns out she meant walking to the bakery. I have never been happier.', names: 'Jin & Hana · Matched in 2022', avatars: ['👨🏻','👩🏻'] },
      { quote: 'Our families planned the wedding. We planned the playlist. Somehow, the playlist won.', names: 'Aisha & Daniel · Matched in 2023', avatars: ['👩🏽','👨🏻'] },
      { quote: 'He can cook. I can eat. We have built a balanced and sustainable relationship.', names: 'Priya & Sam · Matched in 2020', avatars: ['👩🏽','👨🏽'] }
    ];
    let storyIndex = 0;
    $('#storyDots').innerHTML = stories.map((_, i) => `<button type="button" aria-label="Show story ${i + 1}" class="${i === 0 ? 'active' : ''}" data-story="${i}"></button>`).join('');
    function renderStory() {
      const s = stories[storyIndex]; $('#storyQuote').textContent = s.quote; $('#storyNames').textContent = s.names;
      $('.story-avatars').innerHTML = s.avatars.map(a => `<span>${a}</span>`).join('');
      $$('#storyDots button').forEach((dot, i) => dot.classList.toggle('active', i === storyIndex));
      $('#storyCard').animate?.([{opacity:.5, transform:'translateY(5px)'},{opacity:1, transform:'translateY(0)'}], {duration:260, easing:'ease-out'});
    }
    $('#storyPrev').addEventListener('click', () => { storyIndex = (storyIndex - 1 + stories.length) % stories.length; renderStory(); });
    $('#storyNext').addEventListener('click', () => { storyIndex = (storyIndex + 1) % stories.length; renderStory(); });
    $$('#storyDots button').forEach(dot => dot.addEventListener('click', () => { storyIndex = Number(dot.dataset.story); renderStory(); }));

    /* --------------------------------
       Pricing selection and FAQ accordion
       -------------------------------- */
    $$('.plan-select').forEach(button => button.addEventListener('click', () => {
      toast(`${button.dataset.plan} selected. This demo won't charge you a single won. 💳`);
      goSignup();
    }));
    $$('.faq-q').forEach(button => button.addEventListener('click', () => {
      const item = button.closest('.faq-item'), answer = $('.faq-answer', item), isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen)); answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : '0px';
    }));

    /* --------------------------
       Sign-up form with validation
       -------------------------- */
    function emojiCount(value) {
      // Count visible pictographs as a lightweight front-end approximation.
      return [...value.matchAll(/\p{Extended_Pictographic}/gu)].length;
    }
    $('#signupForm').addEventListener('submit', e => {
      e.preventDefault(); const error = $('#signupError'); error.textContent = '';
      const name = $('#signupName').value.trim(), age = Number($('#signupAge').value), gender = $('#signupGender').value, city = $('#signupCity').value.trim(), emojis = $('#signupEmoji').value.trim();
      if (!name || !age || !gender || !city || !emojis) { error.textContent = 'Tiny reminder: every field needs a little love.'; return; }
      if (age < 18 || age > 99) { error.textContent = 'Please enter an age between 18 and 99.'; $('#signupAge').focus(); return; }
      if (emojiCount(emojis) !== 3) { error.textContent = 'We need exactly 3 emojis. Three tiny windows into your soul.'; $('#signupEmoji').focus(); return; }
      $('#signupFormArea').style.display = 'none'; $('#signupSuccess').classList.add('show');
      $('#successCopy').textContent = `${name}, your demo profile is ready in ${city}. Somewhere, a future person just felt a disturbance in the snack force. (No information has been sent or saved.)`;
      launchConfetti(75);
    });
    $('#signupAgain').addEventListener('click', () => { $('#signupForm').reset(); $('#signupError').textContent = ''; $('#signupSuccess').classList.remove('show'); $('#signupFormArea').style.display = 'block'; });

    /* -----------------------------
       LoveBot: local advice responses
       ----------------------------- */
    const botReplies = [
      'Green flag check: they are kind to service workers, communicate clearly, and do not make you feel like a detective. Three for three? We love that.',
      'First-date cheat code: pick a public place, keep it low-pressure, ask curious questions, and wear shoes you can comfortably leave in. Safety first, slay second.',
      'Being left on read is not a personality assessment. Give it a little time, then communicate once. Do not send “???” like a Victorian ghost.',
      'A healthy relationship is not 24/7 butterflies. It is respect, consistency, repair after conflict, and someone who saves you the crispy bit.',
      'Your standards are not “too high” because you want honesty, kindness, and emotional availability. The bar is on the floor. Let’s not dig.',
      'If they say “I am bad at texting” but post 19 stories a day, I fear the Wi-Fi is working. Ask for what you need, then watch the actions.',
      'Do not confuse potential with a project. You are looking for a partner, not an unpaid renovation internship.'
    ];
    function addBotMessage(text, user = false) {
      const msg = document.createElement('div'); msg.className = `bot-msg${user ? ' user' : ''}`; msg.textContent = text; $('#botMessages').appendChild(msg); $('#botMessages').scrollTop = $('#botMessages').scrollHeight;
    }
    function botAnswer(question) {
      const q = question.toLowerCase(); let answer;
      if (q.includes('read') || q.includes('reply') || q.includes('text')) answer = botReplies[2];
      else if (q.includes('first date') || q.includes('nerv')) answer = botReplies[1];
      else if (q.includes('green flag')) answer = botReplies[0];
      else if (q.includes('standard') || q.includes('too much')) answer = botReplies[4];
      else answer = botReplies[Math.floor(Math.random() * botReplies.length)];
      setTimeout(() => addBotMessage(answer), reduceMotion ? 0 : 420);
    }
    $('#lovebotLaunch').addEventListener('click', () => {
      const panel = $('#botPanel'), opened = panel.classList.toggle('open'); panel.setAttribute('aria-hidden', String(!opened));
      if (opened) $('#botInput').focus();
    });
    $('#botClose').addEventListener('click', () => { $('#botPanel').classList.remove('open'); $('#botPanel').setAttribute('aria-hidden','true'); });
    $('#botForm').addEventListener('submit', e => {
      e.preventDefault(); const input = $('#botInput'), q = input.value.trim(); if (!q) return; addBotMessage(q, true); input.value = ''; botAnswer(q);
    });
    $$('.bot-suggestions button').forEach(button => button.addEventListener('click', () => { addBotMessage(button.dataset.question, true); botAnswer(button.dataset.question); }));

    /* ------------------------------------
       Match modal, confetti and logo easter egg
       ------------------------------------ */
    function showMatch(name = 'your person') {
      $('#matchCopy').textContent = `You and ${name} both have top-tier potential. The group chat is about to get LOUD. (Sample match, obviously.)`;
      $('#matchOverlay').classList.add('show'); launchConfetti(105);
    }
    function closeMatch() { $('#matchOverlay').classList.remove('show'); }
    $('#matchClose').addEventListener('click', closeMatch); $('#matchContinue').addEventListener('click', closeMatch);
    $('#matchOverlay').addEventListener('click', e => { if (e.target === $('#matchOverlay')) closeMatch(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMatch(); $('#botPanel').classList.remove('open'); $('#botPanel').setAttribute('aria-hidden','true'); } });
    function launchConfetti(amount = 55) {
      const fragments = ['♥','✦','●','◆'];
      for (let i = 0; i < amount; i++) {
        const piece = document.createElement('span'); piece.className = 'confetti-piece'; piece.textContent = fragments[Math.floor(Math.random() * fragments.length)];
        piece.style.left = `${Math.random() * 100}vw`; piece.style.color = ['#e9a7b6','#c99a45','#a63d5b','#fff0d4'][Math.floor(Math.random()*4)];
        piece.style.fontSize = `${7 + Math.random() * 11}px`; piece.style.setProperty('--duration', `${2.2 + Math.random() * 2.2}s`); piece.style.setProperty('--drift', `${(Math.random() - .5) * 220}px`);
        document.body.appendChild(piece); setTimeout(() => piece.remove(), 4800);
      }
    }
    let logoClicks = 0, logoTimer;
    $('#logoEasterEgg').addEventListener('click', e => {
      e.preventDefault(); logoClicks++; clearTimeout(logoTimer);
      if (logoClicks >= 5) { logoClicks = 0; launchConfetti(100); toast('You found love! Or at least the Easter egg. 🥚💘'); }
      else logoTimer = setTimeout(() => { logoClicks = 0; }, 2200);
    });

    /* ---------------------------
       Scroll reveal and background FX
       --------------------------- */
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 });
    $$('.reveal').forEach(el => revealObserver.observe(el));
    if (!reduceMotion) {
      // A few subtle floating hearts in the background, never over interactive controls.
      setInterval(() => {
        const heart = document.createElement('span'); heart.className = 'floating-heart'; heart.textContent = Math.random() > .5 ? '♡' : '♥';
        heart.style.left = `${Math.random() * 100}vw`; heart.style.bottom = '-25px'; heart.style.fontSize = `${10 + Math.random() * 18}px`;
        document.body.appendChild(heart); setTimeout(() => heart.remove(), 8200);
      }, 1700);
      let lastCursorHeart = 0;
      document.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch' || Date.now() - lastCursorHeart < 85) return;
        lastCursorHeart = Date.now(); const heart = document.createElement('span'); heart.className = 'cursor-heart'; heart.textContent = Math.random() > .25 ? '♡' : '✦';
        heart.style.left = `${e.clientX}px`; heart.style.top = `${e.clientY}px`; document.body.appendChild(heart); setTimeout(() => heart.remove(), 820);
      }, { passive: true });
    }

    // Footer social links are placeholders in this static prototype.
    $$('footer a[href="#"]').forEach(link => link.addEventListener('click', e => { e.preventDefault(); toast('Social links will be connected in the full launch. ✨'); }));
