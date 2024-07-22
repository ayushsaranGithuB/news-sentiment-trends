// fetch the data from the API
async function fetchData() {
  // Get query parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get("topic");

  const response = await fetch("/api/search/" + search);
  const apiResponse = await response.json();

  document.getElementById("page-title").innerText = search;
  document.getElementById("loading").classList.add("hide");

  makeChart(apiResponse.result);
  showArticles(apiResponse.result);
  showStats(apiResponse.result);
}

function makeChart(articles) {
  // Makes a chart with Chart.js
  const ctx = document.getElementById("myChart");
  let labels = [];
  let data = [];

  let avgLabels = [];
  let avgData = [];

  //   Sort the articles by date
  articles.sort((a, b) => a.date - b.date);

  //   loop through the articles and get the date, title, url and sentiment score
  articles.forEach((article) => {
    const date = new Date(article.date * 1000).toLocaleDateString();
    // Check if the date exists in the labels array, if not add it, if it does, add the sentiment score to the data array for that date
    if (labels.includes(date)) {
      let index = labels.indexOf(date);
      // console.log(date, data[index], "+=", article.sentiment.score);
      data[index] += article.sentiment.score;

      // add the sentiment score to the average data array after dividing by the number of articles with the same date
      avgData[index] +=
        article.sentiment.score /
        articles.filter(
          (article) =>
            new Date(article.date * 1000).toLocaleDateString() === date
        ).length;
    } else {
      labels.push(new Date(article.date * 1000).toLocaleDateString());
      data.push(article.sentiment.score);
      avgLabels.push(date);
      avgData.push(article.sentiment.score);
    }
  });

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Sentiment",
          data: data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Average Daily Sentiment",
          data: avgData,
          fill: false,
          borderColor: "rgb(205, 199, 32)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: {
            callback: function (label) {
              let realLabel = this.getLabelForValue(label);
              var day = realLabel.split("/")[1];
              return realLabel;
            },
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context) {
              // console.log(context);
              let date = context[0].label;
              //   Find all articles with the same date
              let articlesWithSameDate = articles.filter(
                (article) =>
                  new Date(article.date * 1000).toLocaleDateString() === date
              );

              return date + " - " + articlesWithSameDate.length + " articles";
            },
          },
        },
      },
    },
  });
}

function showStats(articles) {
  // This section shows the follwing stats
  //   1. Average Sentiment
  //   2. Total Positive Articles
  //   3. Total Negative Articles
  const averageSentiment = articles.reduce(
    (acc, article) => acc + article.sentiment.score,
    0
  );
  document.getElementById("average-sentiment-value").innerText = (
    averageSentiment / articles.length
  ).toFixed(2);

  const positiveArticles = articles.filter(
    (article) => article.sentiment.text === "positive"
  );
  document.getElementById("positive-articles-value").innerText =
    positiveArticles.length;

  const negativeArticles = articles.filter(
    (article) => article.sentiment.text === "negative"
  );
  document.getElementById("negative-articles-value").innerText =
    negativeArticles.length;
}

function showArticles(articles) {
  const articlesContainer = document.getElementById("articles");

  articles.forEach((article) => {
    // convert sentiment.text to a symbol (↑ ↓)
    let sentimentSymbol = "";
    if (article.sentiment.text === "positive") {
      sentimentSymbol = `<span class='positive'>↑ +${article.sentiment.score}</span>`;
    } else if (article.sentiment.text === "negative") {
      sentimentSymbol = `<span class='negative'>↓ ${article.sentiment.score}</span>`;
    }

    const articleElement = document.createElement("div");
    articleElement.classList.add("article");
    articleElement.innerHTML = `
      <div class="article-image">
        <img src="${article.image}" alt="${article.title}" />
      </div>
      <div class="article-content">
        <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
        <p>${article.description.substr(0, 180)}..</p>
        <div class='meta'>
            <div class="sentiment">
                ${sentimentSymbol}
            </div>
            <div class="article-info">
                <span>${new Date(
                  article.date * 1000
                ).toLocaleDateString()}</span>
                <span>${article.source.name}</span>
                <span>${article.category.join(", ")}</span>
            </div>
        </div>
      </div>
    `;
    articlesContainer.appendChild(articleElement);
  });
}

// on load
fetchData();
