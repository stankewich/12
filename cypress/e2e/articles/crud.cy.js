import { faker } from '@faker-js/faker';
import { login } from '/cypress/support/shared';
import meUser from '/cypress/fixtures/me-user.json';

function generateFakeArticle() {

    return {
        title: faker.lorem.words(3),
        description: faker.lorem.sentences(1),
        body: faker.lorem.paragraphs(1),
        tags: [
            faker.word.adjective(),
            faker.word.adjective(),
            faker.word.adjective()
        ]
    };
}

function clearArticle() {

    cy.get('@editArticleForm').find('input[name=title]').clear();
    cy.get('@editArticleForm').find('input[name=description]').clear();
    cy.get('@editArticleForm').find('textarea[name=body]').clear();
    cy.get('@editArticleForm').find('input[name=tags]').clear();

}

function fillArticle() {

    const article = generateFakeArticle();

    // fill and submit form
    cy.get('@editArticleForm').find('input[name=title]').type(article.title);
    cy.get('@editArticleForm').find('input[name=description]').type(article.description);
    cy.get('@editArticleForm').find('textarea[name=body]').type(article.body);

    cy.get('@editArticleForm').find('input[name=tags]').as('articleTagInput');
    for (const tag of article.tags) {
        cy.get('@articleTagInput').type(tag).type(' ');
    }

    return article;
}

function checkArticle(article) {

    // check article data
    cy.get('@articlePage').find('h1').should('contains.text', article.title);

    cy.get('@articlePage').find('.tag-list').as('articleTags');
    for (const tag of article.tags) {
        cy.get('@articleTags').should('contain.text', tag);
    }

    // check Markdown is rendered to HTML
    cy.get('@articlePage').find('.col-md-12 p')
        .invoke('prop', 'innerHTML')
        .should('contains', article.body);

    // TODO: check author & date
}

function addArticle() {

    // open editor
    cy.get('@appHeader').find('a[href$="editor"]').click();
    cy.location('hash').should('eq', '#/editor');

    cy.get('.editor-page').as('addArticlePage');
    cy.get('@addArticlePage').find('form').should('be.visible')
        .as('editArticleForm')

    const article = fillArticle();

    // TODO: should be button[type=submit]
    cy.get('@editArticleForm').find('button[type=submit]').click();

    // waiting for article page
    cy.get('.article-page').should('be.visible');

    return article;
}

function getArticlesList() {

    cy.get('@appHeader').contains('li', meUser.username).click();
    cy.get('@appHeader').find('a.dropdown-item')
        .contains('Profile')
        .click();
    cy.url().should('include', meUser.username);

    // my articles should be active
    cy.get('.articles-toggle > ul > li:first-child a')
        .should('have.class', 'active');

}

function openMyArticle(article) {

    getArticlesList();

    // cy.get('article-list').should('be.visible').as('myArticles');

    // find my article
    cy.get('.article-preview').find('a.preview-link')
        .contains(article.title).click();
}

describe('Articles', () => {

    before(() => {

        cy.request({ method: 'POST', url: '/api/db/undo' })
            .its('status').should('eq', 200);
        cy.request({ method: 'POST', url: '/api/db/seed' })
            .its('status').should('eq', 200);
    });

    beforeEach(() => {
        cy.visit('/');
        cy.get('.navbar').should('be.visible').as('appHeader');
        login();
    });

    it('should do publish article', () => {

        const article = addArticle();
        cy.get('.article-page').should('be.visible').as('articlePage');
        checkArticle(article);

    });

    it('should do delete article', () => {

        const article = addArticle();
        openMyArticle(article);
        // TODO: should be `.article-actions button[data-cy=delete]`
        cy.get('.article-actions :first-child button')
            .find('i.ion-trash-a')
            .click();

        cy.location('hash').should('eq', '#/');

        getArticlesList();

        cy.get('.article-preview')
            .should('not.contain.text', 'Loading')
            .should('be.visible')
            .contains(article.title)
            .should('have.length', 0);
    });

    it('should do edit article', () => {

        const article = addArticle();

        openMyArticle(article);

        // TODO: should be `.article-actions a[data-cy=edit]`
        cy.get('.article-actions a[href*="#/editor"]').click();

        cy.get('.editor-page').as('editArticlePage');

        cy.get('@editArticlePage').find('form')
            .should('be.visible').as('editArticleForm');

        clearArticle();

        const newArticle = fillArticle();

        // TODO: should be button[type=submit]
        cy.get('@editArticlePage').find('button[type=submit]').click();

        // waiting for article page
        cy.get('.article-page').should('be.visible').as('articlePage');

        // checkArticle(newArticle);
    });

});
