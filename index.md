---
layout: page
title: Documentation
product: Evidos
---

Evidos stands for Evidence in Online Services, that is to say being secure while operating on the internet.
Evidos is a market leader in the field of electronic signatures and electronic identification.
Our solutions allow you to conduct your business on the internet quickly, safely and in a legally valid manner, enabling faster and more efficient delivery of your products and services.

For over a decade, Evidos has been actively involved in the latest national and international standards, legislation and technologies for identity verification and electronic signatures.
Thanks to our business administration background and excellent understanding of the technical aspects, we can offer solutions to a wide range of companies and organisations in various sectors.
We offer solutions that are both high quality and outcome-driven.

## Products
This documentation website provides documentation for the following Evidos products:

<ul>
{% for product in site.data.structure %}
    {% unless product.name == "Evidos" %}
        <li>
            <a href="{{ product.menu[0].permalink }}">{{ product.name }}</a>
        </li>
    {% endunless %}
{% endfor %}
</ul>

## Posts
<ul class="post-list">
  {% for post in site.posts reversed %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} - {{ post.product }}</span>

      <h2>
        <a class="post-link" href="{{ post.url }}">{{ post.title }}</a>
      </h2>
    </li>
  {% endfor %}
</ul>
