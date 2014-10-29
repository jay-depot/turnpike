/**
 * Access control rules for the Page controller.
 * Typically you want this to allow all access, and handle more restrictive
 * cases inside specific actions.
 */

function Page(route, callback) {
  callback(undefined, true);
}

module.exports = Page;
