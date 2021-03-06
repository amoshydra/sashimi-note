<template>
  <div class="navbar">
    <div class="section group userInputs vertical-align-child">
      <div class="col button-logo inline-block">
        <router-link to="/" class="vertical-align-child">
          <img src="../../assets/sashimi-note.svg" class="inline-block" alt="sashimi">
        </router-link>
      </div>
      <!--Waiting for file-manager api to be completed to implement buttons-->
      <div class="col searchBar-wrapper inline-block vertical-align-child">
        <div class="section group searchBar vertical-align-child">

          <i class="col material-icons md-dark">search</i>
          <input
            class="col"
            type="text"
            placeholder="Search"
            v-model="searchString"
            required="required"
            ref="searchInput"
          >
          <button class="col">
            <i class="material-icons md-dark"
                v-on:click="clearSearchString($event)">clear</i>
          </button>
        </div>
      </div>
      <div class="col view-type-wrapper inline-block">
        <div class="view-type">
          <button id="button-icon-view" class="navbar-buttons" 
                  v-on:click="setViewMode('iconView')"
                      :class="{ 'toggle-view-active': iconViewMode }"
          >Icon</button>|
          <button id="button-list-view" class="navbar-buttons" 
                  v-on:click="setViewMode('listView')"
                  :class="{ 'toggle-view-active': listViewMode }"
          >List</button>
        </div>
      </div>
    </div>
    <div class="section group userActions vertical-align-child">
      <div class="col float-left vertical-align-child">
        <button class="navbar-buttons" 
                v-on:click="execute('history back')"
        >
          <i class="material-icons md-dark">keyboard_arrow_left</i>
        </button>
        <button class="navbar-buttons" 
                v-on:click="execute('history forward')"
        >
          <i class="material-icons md-dark">keyboard_arrow_right</i>
        </button>
        <ul class="navbar-breadcrumb inline-block">
          <li v-if="searchString !== ''">
            Search results
          </li>
          <template v-else>
            <li>
              <router-link to="/" class="breadcrumb-active">
                Home
              </router-link>
            </li>
            <li v-for="(folder, index) in folderPath" v-if="folder.name !== 'root'">
              <template v-if="index !== folderPath.length-1" >
                <router-link 
                  :to="{ name: 'fileManager', query: { folder: folder.id } }"
                  class="breadcrumb-active"
                >
                  {{folder.name}}
                </router-link>
              </template>
              <template v-else>
                {{folder.name}}
              </template>
            </li>
          </template>
        </ul>
      </div>
      <div class="float-right">
        <div class="col vertical-align-child buttons-right inline-block">
          <!--Button yet to be implemented. Commented out for deployment-->
          <!--<button id="button-file-upload" class="navbar-buttons">
            <i class="material-icons md-dark">file_upload</i>
          </button>-->
          <button id="button-create-folder" class="navbar-buttons" 
                  v-on:click="execute('createFolder')"
          >
            <i class="material-icons md-dark">create_new_folder</i>
          </button>
          <button id="button-create-file" class="navbar-buttons" 
                  v-on:click="execute('createFile')"
          >
            <i class="material-icons md-dark">note_add</i>
          </button>
          <!--Button yet to be implemented. Commented out for deployment-->
          <!--<button id="button-duplicate" class="navbar-buttons" 
          >
            <i class="material-icons md-dark" 
              v-bind:class="{'md-inactive': buttonDisabled}"
            >content_copy</i>-->
          </button>
          <button id="button-file-download" class="navbar-buttons" 
                    v-on:click="execute('download')"
          >
            <i class="material-icons md-dark" 
                v-bind:class="{'md-inactive': buttonDisabled}">file_download</i>
          </button>
          <button id="button-delete" class="navbar-buttons" 
                  v-on:click="execute('delete')"
          >
            <i class="material-icons md-dark" 
                v-bind:class="{'md-inactive': buttonDisabled}"
            >delete</i>
          </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import eventHub from './EventHub';

let userInputsVue = null;

export default {
  data() {
    return {
      buttonDisabled: true,
      focusedDoc: null,
      holdingDoc: null,
      searchString: '',
      iconViewMode: true,
      listViewMode: false,
    };
  },
  props: ['folderPath', 'viewMode'],
  methods: {
    execute(action) {
      eventHub.$emit('execute', action);
      switch (action) {
        case 'delete':
        case 'duplicate':
        case 'download': {
          if (this.focusedDoc) {
            this.$emit('execute', action, this.focusedDoc);
            this.focusedDoc = null;
          }
          break;
        }
        default: {
          this.$emit('execute', action);
          break;
        }
      }
    },
    setViewMode(viewMode) {
      if (viewMode === 'iconView') {
        this.iconViewMode = true;
        this.listViewMode = false;
      } else {
        this.iconViewMode = false;
        this.listViewMode = true;
      }
      userInputsVue.$emit('changeViewMode', viewMode);
    },
    clearSearchString() {
      this.searchString = '';
    }
  },
  watch: {
    searchString: _.debounce((result) => {
      userInputsVue.$emit('execute', 'search', result);
    }, 500),
    $route() {
      this.searchString = '';
    },
    focusedDoc(theDoc) {
      this.buttonDisabled = Boolean(!theDoc);
    },
    viewMode(mode) {
      this.setViewMode(mode);
    }
  },
  mounted() {
    userInputsVue = this;

    eventHub.$on('focus', (focusedDoc) => {
      this.focusedDoc = focusedDoc;
    });
    eventHub.$on('blur', (event) => {
      const clickTarget = (event.relatedTarget) ? event.relatedTarget.id : null;
      if (!(clickTarget === 'button-delete' || clickTarget === 'button-file-download')) {
        this.focusedDoc = null;
      }
    });
  },
};
</script>

<style scoped lang="scss">
@import 'src/assets/styles/variables.scss';
.navbar {
  padding-top: 22px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  z-index: 999;
  position: relative;
  box-sizing: border-box;
  height: $file-manager-navbar-height;
}

.searchBar-wrapper {
  width: $searchbar-wrapper-mobile-width;
  text-align: left;
  overflow: hidden;
  animation: userInput $user-input-keyframe-time;
  height: 45px;
  margin-top: -5px;

  .searchBar {
    background-color: $grey-background;
    width: 90%;
    margin: 0 auto;
    height: 100%;
  }

  i {
    font-size: 20px;
    padding: 12px;
  }
  
  button {
    background-color: $grey-background;
    border: 0;
    padding: 0;
    box-sizing: border-box;
  }

  input {
    border: none;
    border-radius: 6px;
    background-color: $grey-background;
    width: calc(100% - #{$searchbar-icons-width}*2);
    padding: 13px;
    font-family: $font-primary;
    font-size: 17px;
    box-sizing: border-box;
  }

  input:invalid + button {
    display: none;
  }
}

.userActions {
  /*background-color: $navbar-background-color;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);*/
  padding-top: 15px;
}

.navbar-breadcrumb {
  display: none;
  list-style: none;
  font-size: $navbar-font-size;
  padding-left: 0;
  margin: 0;
  vertical-align: middle;
  color: $grey-font;

  .breadcrumb-active {
    color: black;
  }

  li {
    display: inline;

    &+li:before {
      padding: 2px;
      color: black;
      content: "/\00a0";
    }

    a {
      &:visited {
        color: black;
      }
    }
  }
}

.navbar-buttons {
  margin: 0 2px;
  height: 32px;
  padding-left: 3px;
  padding-right: 3px;

  @media screen and (min-width: 480px) {
    padding-left: 6px;
    padding-right: 6px;
  }
}

.view-type-wrapper {
  display: none;
  font-size: $navbar-font-size;
  font-family: $font-primary;
  float: right;
  animation: viewTypeWidth $user-input-keyframe-time;
  width: $view-type-buttons-width;

  .view-type {
    width: 110px;
    overflow: hidden;

    button {
      font-family: $font-primary;
    }
  }

  a {
    text-decoration: none;

    &:visited {
      color: black;
    }
  }
}

.toggle-view-active {
    text-transform: uppercase;
    font-weight: bold;
  }

@media screen and (min-width: 480px) {
  .searchBar-wrapper {
    width: $searchbar-wrapper-480px-width;
  }

  .view-type-wrapper {
    display: inline-block;
  }
}

@media screen and (min-width: 768px) {
  .searchBar-wrapper {
     width: $searchbar-wrapper-768px-width;
   }

  .userActions  {
    .buttons-right {
      display: inline-block;
    }
  }

  .navbar-breadcrumb {
    display: inline-block;
  }
}
</style>
