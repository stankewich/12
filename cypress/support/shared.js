import meUser from '/cypress/fixtures/me-user.json';
import { faker } from '@faker-js/faker';

function generateFakeArticle() {
    return {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        body: faker.lorem.paragraph(),
        tags: [
            faker.word.adjective(),
            faker.word.adjective(),
            faker.word.adjective()
        ]
    };
}

export function login() {

    cy.get('.navbar').should('be.visible').as('appHeader');

    cy.get('@appHeader').find('a[href$="/login"]').click();
    cy.url().should('include', '/#/login');

    cy.get('.auth-page').should('be.visible').as('loginPage');
    cy.get('@loginPage').find('h1').should('have.text', 'Sign in');
    cy.get('@loginPage').find('form').should('be.visible').as('loginForm');

    cy.get('@loginForm').find('input[name=email]').type(meUser.email);
    cy.get('@loginForm').find('input[name=password]').type(meUser.password);
    cy.get('@loginForm').find('button').click();

    cy.get('@appHeader').should('contain.text', meUser.username);

}

export function addArticle() {
    cy.get('@appHeader').find('a[href$="/editor/"]').click();
    cy.url().should('include', '/#/editor/');
    cy.get('.editor-page').find('form').should('be.visible').as('editorForm');
    // get ready for using faker right here!
    const article = generateFakeArticle();
    // seeking input forms:
    cy.get('@editorForm').find('input[ng-model*=title]').type(article.title);
    cy.get('@editorForm').find('input[ng-model*=description]').type(article.description);
    cy.get('@editorForm').find('input[ng-model*=tagField]').as('articleTagInput');
    cy.get('@editorForm').find('textarea[ng-model*=body]').type(article.body);
    for (const tag of article.tags) {
        cy.get('@articleTagInput').type(tag).type('{enter}');
    }
    // submit button click:
    cy.get('@editorForm').find('button[ng-click*=submit]').click();
    // ^ TODO: should be button[type=submit]

    cy.get('.article-page').as('articlePage');
    cy.url().should('include', '/#/article/');
    // in markdown written smt {slug} wat dus it mean?
    cy.get('@articlePage').find('h1').should('contains.text', article.title);
    cy.get('@articlePage').find('[ng-bind-html*=body]').should('contains.text', article.body);
    // LF tags:
    cy.get('@articlePage').find('.tag-list').as('articleTags');
    for (const tag of article.tags) {
        cy.get('@articleTags').should('contains.text', tag);
    }
    return article;
}

export function addComment() {
    cy.get('')
}