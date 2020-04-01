import React from 'react';
import { 
  ModalRoot, Snackbar, ModalPage, ModalPageHeader, FixedLayout, FormStatus, 
  InfoRow, Header, Footer, Avatar, Separator, FormLayout, Input, PanelHeaderButton, 
  View, Panel, PanelHeader, Button, Div, Group, List, Cell, Link, 
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import { randomNumberFromRange, htmlToElement, checkIsCity, getDynamicObjPropName } from './utils/helpers';
import { wikiSearchRequest, wikiOrthographyRequest } from './utils/requests'

import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon28InfoOutline from '@vkontakte/icons/dist/28/info_outline';
import Icon28CheckCircleOutline from '@vkontakte/icons/dist/28/check_circle_outline';

const blueBackground = {
  backgroundColor: 'var(--accent)'
};

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePanel: 'main',
      activeModal: null,
      gameType: 'cities',
      gameWords: null,
      currentWord: null,
      currentAnswer: '',
      gameResults: {
        playerOne: [],
        playerTwo: [],
      },
      errors: null,
      helpData: null,
      wordHint: null,
      wordHintHelpData: null,
      text: '',
      snackbar: null,
    }

    this.openBase = this.openBase.bind(this);

  }

  handleChange = (event) => {
    this.setState({ currentAnswer: event.target.value.trim() });
  }

  renderHeader = () => {
    switch (this.state.gameType) {
      case 'cities':
        return 'Города';
      case 'countries':
        return 'Страны';
      case 'all':
        return 'Все слова';
      case 'plants':
        return 'Растения';
      case 'animals':
        return 'Животные';
      default:
        return 'Игра в слова'
    }
  }

  startGame = () => {
    this.setState({ activePanel: 'game', gameType: 'cities' });
    fetch('./cities.json')
      .then(response => response.json())
      .then(data => {
        let wordsArr = [];
        data.city.forEach(item => {
          if (!item.name.includes('(')) wordsArr.push(item.name);
        })

        let randomIndex = randomNumberFromRange(0, wordsArr.length);
        let randomWord = wordsArr[randomIndex];

        this.helpRender(randomWord);

        this.setState({ gameWords: wordsArr, currentWord: randomWord });
      })
  }

  handleHint = () => {
    let newWord;
    let filteredArr = this.state.gameWords.filter(item => item !== this.state.currentWord);

    if ((/[ыъь)]$/).test(this.state.currentWord)) {
      newWord = filteredArr.find(item => {
        return item[0] === this.state.currentWord[this.state.currentWord.length - 2].toUpperCase();
      });
    } else {
      newWord = filteredArr.find(item => {
        return item[0] === this.state.currentWord[this.state.currentWord.length - 1].toUpperCase();
      });
    }

    fetch(wikiSearchRequest(newWord))
      .then(response => response.json())
      .then(data => {
        let text = data.query.pages[getDynamicObjPropName(data)].extract;

        if (text && text.length > 40) {
          let helpData = htmlToElement(text).outerHTML;
          if (checkIsCity(helpData)) {
            this.setState({ wordHintHelpData: helpData })
          }
        } else {
          this.setState({ wordHintHelpData: null })
        }
      })

    this.setState({ wordHint: newWord })
  }

  handleAnswer = () => {
    const currentAnswer = this.state.currentAnswer;
    const currentWord = this.state.currentWord;
  
    if (!currentAnswer) {
      this.setState({ errors: 'Нужно ввести слово в поле ниже' });
      this.setState({ currentAnswer: '' });
      return;
    }
  
    let currentAnswerCapitalize = currentAnswer[0].toUpperCase() + 
                                  currentAnswer.slice(1, currentAnswer.length);
  
    if ((/[ыъь)]$/).test(currentWord)
      && currentAnswerCapitalize[0] !== currentWord[currentWord.length - 2].toUpperCase()
    ) {
        this.setState({ errors: 'Слово должно начинаться на ' + 
                        currentWord[currentWord.length - 2].toUpperCase() });
        this.setState({ currentAnswer: '' });
        return;
  
    } else if (currentAnswerCapitalize[0] !== currentWord[currentWord.length - 1].toUpperCase() 
           && !(/[ыъь)]$/).test(currentWord)) 
      {
        this.setState({ errors: 'Слово должно начинаться на ' + 
                        currentWord[currentWord.length - 1].toUpperCase() });
        this.setState({ currentAnswer: '' });
        return;
  
    } else if (this.state.gameWords.find(item => item.toLowerCase() === currentAnswer.toLowerCase())) {
      let filteredArr = this.state.gameWords.filter(item => item.toLowerCase() !== currentWord.toLowerCase() 
                                                            && item.toLowerCase() !== currentAnswer.toLowerCase());
  
      let newWord;
      if ((/[ыъь)]$/).test(currentAnswer)) {
        newWord = filteredArr.find(item => item[0] === currentAnswer[currentAnswer.length - 2].toUpperCase());
      } else {
        newWord = filteredArr.find(item => item[0] === currentAnswer[currentAnswer.length - 1].toUpperCase());
      }
  
      let gameResultsNew = {};
      gameResultsNew.playerOne = [...this.state.gameResults.playerOne, currentAnswerCapitalize];
      gameResultsNew.playerTwo = [...this.state.gameResults.playerTwo, currentWord];
  
      this.helpRender(newWord);
      this.openBase();
  
      this.setState({ gameWords: filteredArr, 
                      currentWord: newWord, 
                      wordHint: null, 
                      currentAnswer: '', 
                      wordHintHelpData: null,
                      errors: '', 
                      gameResults: gameResultsNew, 
                      helpData: null 
                    });
  
    } else {
      this.setState({ errors: 'Такого города не существует или его уже называли в этой партии игры' });
    }
  }

  renderLastLetter = () => {
    if ((/[ыъь)]$/).test(this.state.currentWord)) {
      return this.state.currentWord[this.state.currentWord.length - 2].toUpperCase()
    } else {
      return this.state.currentWord[this.state.currentWord.length - 1].toUpperCase()
    }
  }

  renderResults = () => {
    return this.state.gameResults.playerOne.map((item, index) => {
      let playerTwoData = [...this.state.gameResults.playerTwo];
      return (
        <div key={index}>
          <p style={{ padding: '0 12px' }}>
            <span style={{ color: 'var(--dynamic_gray)' }}>{playerTwoData[index]}</span> — {item}
          </p>
          <Separator style={{ margin: '12px 0' }} />
        </div>
      )
    })
  }

  helpRender = (helpItem) => {
    fetch(wikiOrthographyRequest(helpItem))
      .then(response => response.json())
      .then(data => {
        fetch(wikiSearchRequest(data[1][0]))
          .then(response => response.json())
          .then(data => {

            let text = data.query.pages[getDynamicObjPropName(data)].extract;

            if (text && text.length > 40) {
              let helpData = htmlToElement(text).outerHTML;
              if (checkIsCity(helpData)) {
                this.setState({ helpData: helpData })
              }
            } else {
              this.setState({ helpData: null })
            }
          })
      })
  }

  handleHelp = () => {
    this.setState({ activeModal: 'help' });
  }

  openBase = () => {
    if (this.state.snackbar) return;
    this.setState({ snackbar:
      <Snackbar
        layout="vertical"
        duration="2500"
        onClose={() => this.setState({ snackbar: null })}
        before={<Avatar size={24} 
        style={blueBackground}
      >
        <Icon28CheckCircleOutline fill="#fff" width={14} height={14} /></Avatar>}>
        Ура, всё правильно! +1 <span role="img" aria-labelledby="like">👍</span>
      </Snackbar>
    });
  }

  render() {
    const modal = (
      <ModalRoot 
        activeModal={this.state.activeModal} 
        onClose={() => this.setState({ activeModal: null })}>
          <ModalPage
            id='help'
            header={
              <ModalPageHeader
                right={
                  <PanelHeaderButton onClick={() => this.setState({ activeModal: null })}>
                    <Icon24Cancel />
                  </PanelHeaderButton>
                }
          >
            <span role="img" aria-labelledby="thoughts">🤔 </span> Что это за город?
              </ModalPageHeader>
            }
            settlingHeight={80}
          >
            <Div id="help-wrap" dangerouslySetInnerHTML={{ __html: this.state.helpData }} />
          </ModalPage>
      </ModalRoot>
    );

    return (
      <View activePanel={this.state.activePanel} modal={modal}>
        <Panel id="main">
          <PanelHeader>Игра в слова</PanelHeader>

          <Group 
            style={{ marginTop: 24 }} 
            separator="hide" 
            header={<Header mode="secondary">Выберите тип игры</Header>}
          >
            <List>
              <Cell 
                expandable style={{ fontWeight: "bold", fontSize: 20 }} 
                onClick={this.startGame} 
                before={<Avatar style={{ backgroundImage: "url(./icons/cityscape.svg)" }}></Avatar>}
              >
                Города
              </Cell>
              <Separator style={{ margin: '12px 0' }} />

              <Cell 
                description="Скоро" 
                style={{ fontSize: 20 }} 
                before={<Avatar style={{ backgroundImage: "url(./icons/countries.svg)" }}></Avatar>}
              >
                <span style={{ color: "var(--dynamic_gray)", fontWeight: "bold" }}>Страны</span>
              </Cell>
              <Separator style={{ margin: '12px 0' }} />

              <Cell 
                description="Скоро" 
                style={{ fontSize: 20 }} 
                before={<Avatar style={{ backgroundImage: "url(./icons/castle.svg)" }}></Avatar>}
              >
                <span style={{ color: "var(--dynamic_gray)", fontWeight: "bold" }}>Все слова</span>
              </Cell>
              <Separator style={{ margin: '12px 0' }} />

              <Cell 
                description="Скоро" 
                style={{ fontSize: 20 }} 
                before={<Avatar style={{ backgroundImage: "url(./icons/plants.svg)" }}></Avatar>}
              >
                <span style={{ color: "var(--dynamic_gray)", fontWeight: "bold" }}>Растения</span>
              </Cell>
              <Separator style={{ margin: '12px 0' }} />

              <Cell 
                description="Скоро" 
                style={{ fontSize: 20 }} 
                before={<Avatar style={{ backgroundImage: "url(./icons/animals.svg)" }}></Avatar>}
              >
                <span style={{ color: "var(--dynamic_gray)", fontWeight: "bold" }}>Животные</span>
              </Cell>
              <Separator style={{ margin: '12px 0' }} />

            </List>

            <Footer>
              <Div>
                <Button mode="tertiary" onClick={() => this.setState({ activePanel: 'about' })}>О приложении</Button>
              </Div>
            </Footer>

          </Group>
        </Panel>

        <Panel id="game">
          <PanelHeader 
            left={
              <PanelHeaderButton onClick={() => this.setState({ activePanel: 'results' })}>
                <Icon24Cancel />
              </PanelHeaderButton>
            }
          >
            {this.renderHeader()}
          </PanelHeader>

          <Group 
            title="Область игры" 
            className="game-wrap" 
            style={{ marginBottom: 100 }}
          >
            <Div style={{ textAlign: "center" }}> 
              Правильных ответов: {this.state.gameResults.playerOne.length}
            </Div>

            <Div style={{ background: "url(./icons/cityscape.svg) no-repeat", width: 36, height: 36, margin: "8px auto" }} />

            <Div style={{ textAlign: "center", fontWeight: "bold", fontSize: 32 }}>
              {this.state.currentWord}
              {
                this.state.helpData ? 
                <Link style={{ paddingLeft: 8 }} 
                      onClick={this.handleHelp}><Icon28InfoOutline height={24} /></Link> : 
                null
              }
            </Div>

            <Div style={{ textAlign: "center", fontSize: 24 }}>
              Вам на «{this.state.currentWord ? this.renderLastLetter() : null}»

              <FormLayout style={{ marginTop: 16 }}>
                {
                  this.state.errors ? <FormStatus header={this.state.errors} mode="error"></FormStatus> : null
                }
                <Input 
                  type="text" 
                  value={this.state.currentAnswer} 
                  onChange={this.handleChange} 
                  top="Ваш ответ:" 
                  align="center" 
                />
              </FormLayout>

              {
                this.state.wordHint ?
                  <Div 
                    onClick={() => this.setState({ currentAnswer: this.state.wordHint })} 
                    style={{ fontSize: 20, marginBottom: 120 }}
                  >
                    Попробуйте ввести: 
                    <span style={{fontStyle: "italic"}}>{this.state.wordHint}</span>
                    <Div 
                      style={{ fontSize: 16 }} 
                      dangerouslySetInnerHTML={{ __html: this.state.wordHintHelpData }}
                    />
                  </Div>
                  : null
              }

            </Div>

          </Group>

          <FixedLayout vertical="bottom">
            {this.state.snackbar}
            <Div className="footer">
              <Div style={{display: 'flex'}}>
                <Button 
                  size="l" 
                  stretched 
                  mode="secondary" 
                  onClick={this.handleHint} 
                  style={{ marginRight: 8, background: 'var(--float_button_background_highlighted)' }}
                >
                  Подсказка
                </Button>

                <Button 
                  size="l" 
                  stretched 
                  mode="commerce" 
                  onClick={this.handleAnswer}
                >
                  Ответить
                </Button>
              </Div>
            </Div>
          </FixedLayout>

        </Panel>

        <Panel id="results">
          <PanelHeader>
            Итоги игры
          </PanelHeader>
          
          <Div style={{ textAlign: "center", fontWeight: "bold" }}> 
            Правильных ответов: {this.state.gameResults.playerOne.length}
          </Div>

          <Div className='results-wrap' style={{mrginBottom: 120}}>
            { this.state.gameResults.playerOne ? this.renderResults() : null }
          </Div>

          <FixedLayout vertical="bottom">
            <Div className="footer">
              <Div>
                <Button 
                  size="xl" 
                  onClick={() => this.setState({ activePanel: 'main', 
                                                 wordHint: null,
                                                 helpData: null,
                                                 currentAnswer: '', 
                                                 errors: '', 
                                                 wordHintHelpData: null,
                                                 gameResults: { playerOne: [], playerTwo: [] }
                                               })}
                >
                  Ок
                </Button>
              </Div>
            </Div>
          </FixedLayout>

        </Panel>

        <Panel id="about">
          <PanelHeader 
            left={
              <PanelHeaderButton onClick={() => this.setState({ activePanel: 'main' })}>
                <Icon24Cancel />
              </PanelHeaderButton>
            }>
            О приложении
          </PanelHeader>
          
          <Group header={<Header mode="secondary">Используемые ресрсы</Header>}>
            <List>
              <Cell>
                <InfoRow header="Иконки">
                  Icons made by 
                  <Link href="https://www.flaticon.com/authors/freepik">
                    Freepik
                  </Link> 
                  from 
                  <Link href="https://www.flaticon.com/">
                    www.flaticon.com
                  </Link>
                </InfoRow>
              </Cell>
            </List>
          </Group>

        </Panel>
      </View>
    )
  }
}

export default App;
