const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const slider = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustButton = document.querySelectorAll(".close-adjustment");
const slidePanel = document.querySelectorAll(".slider");
let initialColor;

//Event Listeners
lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});
generateBtn.addEventListener("click", randomColors);
slider.forEach((sliders) => {
  sliders.addEventListener("input", hslUpdate);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateUI(index);
  });
});
currentHex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClip(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupWindow = popup.children[0];
  popup.classList.remove("active");
  popupWindow.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    adjustOpen(index);
  });
});
closeAdjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeButton(index);
  });
});
//Functions

function generateHex() {
  // const letters = "0123456789ABCDEF";
  // let hex = "#";
  //   for (let i = 0; i < 6; i++) {
  //     hex += letters[Math.floor(Math.random() * 16)];
  //   }
  const hex = chroma.random();
  return hex;
}

function randomColors() {
  initialColor = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    //initialColor.push(chroma(randomColor).hex());
    if (div.classList.contains("locked")) {
      initialColor.push(hexText.innerText);
      return;
    } else {
      initialColor.push(chroma(randomColor).hex());
    }

    //Add color to bg
    div.style.background = randomColor;
    hexText.innerText = randomColor;

    //Check contrast

    checkTextContrast(randomColor, hexText);

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".slider input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorSlider(color, hue, brightness, saturation);
  });
  //Resetting Inputs

  resetInputs();

  //check buttons contrast

  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColor[index], button);
    checkTextContrast(initialColor[index], lockButton[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorSlider(color, hue, brightness, saturation) {
  //scale saturation
  const noSat = color.set("hsl.s", 0);
  const FullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, FullSat]);
  //Scale brightness
  const midColor = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midColor, "white"]);

  //update colors of inputrange
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}
function hslUpdate(e) {
  const index =
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-hue");
  let slider = e.target.parentElement.querySelectorAll("input[type=range]");
  const hue = slider[0];
  const bright = slider[1];
  const sat = slider[2];
  // console.log(hue.value, sat.value, bright.value);
  // const bgColor = colorDivs[index].querySelector("h2").innerText;
  // const bgColor = initialColor[index];
  const bgColor = initialColor[index];
  let color = chroma(bgColor)
    .set("hsl.s", sat.value)
    .set("hsl.l", bright.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;

  colorSlider(color, hue, bright, sat);
}

function updateUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  // console.log(color);
  const text = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  text.innerText = color.hex();

  checkTextContrast(color, text);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const slides = document.querySelectorAll(".slider input");
  slides.forEach((slide) => {
    if (slide.name === "hue") {
      const hueColor = initialColor[slide.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slide.value = Math.floor(hueValue);
    }
    if (slide.name === "brightness") {
      const brightColor = initialColor[slide.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slide.value = Math.floor(brightValue * 100) / 100;
    }
    if (slide.name === "saturation") {
      const satColor = initialColor[slide.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slide.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClip(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popupWindow = popup.children[0];
  popup.classList.add("active");
  popupWindow.classList.add("active");
}
function adjustOpen(index) {
  slidePanel[index].classList.toggle("active");
}
function closeButton(index) {
  slidePanel[index].classList.remove("active");
}
function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  // console.log(activeBg);
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}
//Implementing save to palatte and local storage

let savePalatte = [];
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-name");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", opneSavePanel);
closeSave.addEventListener("click", closePalatte);
submitSave.addEventListener("click", savePal);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function opneSavePanel() {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalatte() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savePal() {
  //const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const color = [];
  currentHex.forEach((hex) => {
    color.push(hex.innerText);
  });
  //start from previous
  let palatteNb;
  const palatteObjects = JSON.parse(localStorage.getItem("palattes"));
  if (palatteObjects) {
    palatteNb = palatteObjects.length;
  } else {
    palatteNb = savePalatte.length;
  }

  const palatteOb = { name, color, Nb: palatteNb };
  savePalatte.push(palatteOb);
  //Save to local storage
  saveToLocal(palatteOb);
  //console.log(name, color);
  saveInput.value = "";
}

function saveToLocal(palatteOb) {
  let localPalettes;
  if (localStorage.getItem("palattes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palattes"));
  }
  localPalettes.push(palatteOb);
  localStorage.setItem("palattes", JSON.stringify(localPalettes));

  //generate the palatte for library
  const palatte = document.createElement("div");
  palatte.classList.add("custom-palatte");
  const title = document.createElement("h4");
  title.innerText = palatteOb.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  palatteOb.color.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const palatteBtn = document.createElement("button");
  palatteBtn.classList.add("palatte-btn");
  palatteBtn.classList.add(palatteOb.Nb);
  palatteBtn.innerText = "Select";

  palatteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const palatteIndex = e.target.classList[1];
    initialColor = [];
    savePalatte[palatteIndex].color.forEach((clr, index) => {
      initialColor.push(clr);
      colorDivs[index].style.backgroundColor = clr;
      const text = colorDivs[index].children[0];
      updateUI(index);
      //checkTextContrast(clr, text);
    });
    resetInputs();
  });

  palatte.appendChild(title);
  palatte.appendChild(preview);
  palatte.appendChild(palatteBtn);

  libraryContainer.children[0].appendChild(palatte);
}
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palattes") === null) {
    localPalettes = [];
  } else {
    const pallateObject = JSON.parse(localStorage.getItem("palattes"));
    savePalatte = [...pallateObject];
    pallateObject.forEach((palatteOb) => {
      const palatte = document.createElement("div");
      palatte.classList.add("custom-palatte");
      const title = document.createElement("h4");
      title.innerText = palatteOb.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      palatteOb.color.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const palatteBtn = document.createElement("button");
      palatteBtn.classList.add("palatte-btn");
      palatteBtn.classList.add(palatteOb.Nb);
      palatteBtn.innerText = "Select";

      palatteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const palatteIndex = e.target.classList[1];
        initialColor = [];
        pallateObject[palatteIndex].color.forEach((clr, index) => {
          initialColor.push(clr);
          colorDivs[index].style.backgroundColor = clr;
          const text = colorDivs[index].children[0];
          updateUI(index);
          //checkTextContrast(clr, text);
        });
        resetInputs();
      });

      palatte.appendChild(title);
      palatte.appendChild(preview);
      palatte.appendChild(palatteBtn);

      libraryContainer.children[0].appendChild(palatte);
    });
  }
}
getLocal();

randomColors();
